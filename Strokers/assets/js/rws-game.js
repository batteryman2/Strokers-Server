	var numplayers = 0;
	var g_players = null;
	var g_courses = null;
	var g_solid = false;
	var g_selcourse = 1;
	var g_hdcpCourse = 1;
	var g_selplayers = [];
	var g_from = "";
	var g_game = null;
	var g_editplayers=null;
	var g_test = [];
	var g_editpartners=g_test;
	var g_editIndex=0;
	var g_Dotsf=[];
	var g_Dotsb=[];
	var g_Scoref=[];
	var g_Scoreb=[];
	var g_editBoxOrder;
	var g_editCarry;
	var WOLF=0;
	var DOTS=1;
	var BLIND=2;
	var GREENY=3;
	var g_selGameType;
	
	var GT_WOLF=1;
	var GT_LR=2;
	var GT_PELOSI=3;
	var GT_LUCKY=4;
	var GT_COINS=5;
	var GT_NONE=0;
	
	var g_gameplayershtml;
	var g_scoreMenuWidth;
	var g_currentUser=null;
	var g_thegame=null;			/// parse game object
	var g_gameid = null;		// objectId of game from user


	

		
	Parse.initialize('oss-f8-app-2016');
	Parse.serverURL = 'http://rwsdo.duckdns.org:8080/parse';

	
	function getHDCP( hindex, course )
	{
		return Math.round((hindex*g_courses[course].slope)/113);
	}
	
	
	function htmlGame()		// called from newGame or refresh with g_game valid, g_selcourse must be valid
	{
		g_game.basehcd = 9999;
		for (var i = 0; i < g_game.players.length; i++) {
			if(g_game.players[i].hindex < g_game.basehcd)
				g_game.basehcd = g_game.players[i].hindex;
		}
		g_game.basehcd = getHDCP(g_game.basehcd,g_selcourse);
		g_gameplayershtml = '<div class="ngameplayers"><table style="width:100%;font-weight:bold;text-align:center; background-color:rgba( 0, 0, 0, .5); color:#fff"><tr style="border-bottom: #ccc 1px solid;"><td style="width:60%;"></td>';
//		g_gameplayershtml += '<td style="width:20%;color:blue;font-size: 16px;">Score</td><td style="width:20%;color:blue;font-size: 16px;">Dots</td></tr>';
		g_gameplayershtml += '<td style="width:20%;color:white;font-size: 16px;">Score</td><td style="width:20%;color:white;font-size: 16px;">Dots</td></tr>';
        for (var i = 0; i < g_game.players.length; i++) {
			var poping=" rws-pop-white";
			var name = g_game.players[i].named.split(" ");
			var hdcp = getHDCP(g_game.players[i].hindex, g_selcourse);
			if( (hdcp-g_game.basehcd) >= g_courses[g_selcourse].hdcp[g_game.activehole-1])
				poping=" rws-pop-blue";
			var score = g_game.players[i].score[g_game.activehole-1];
			var holedots = g_game.players[i].trashdots[g_game.activehole-1]+g_game.players[i].gamedots[g_game.activehole-1];
			g_gameplayershtml += '<tr style="border-bottom:#ccc 1px solid"><td style="font-size: 16px;text-align:left;padding: 10px 0px 10px 5px"><table>';
			g_gameplayershtml += '<tr><td rowspan="2"><i id="po'+i+'" class="fa fa-user-o'+poping+'" style="font-size:1.5em"></i></td><td style="padding-left:20px">';
			g_gameplayershtml += name[0]+' ('+hdcp+')</td></tr><tr><td style="padding-left:30px">'+name[1]+'</td></tr></table></td>';
			g_gameplayershtml += '<td style="font-size: 16px;" id="sc'+i+'">'+score+'</td><td style="font-size: 16px;" id="do'+i+'">'+holedots+'</td></tr>';
		}
		g_gameplayershtml += '</table></div>';
//		console.log(g_gameplayershtml);
		$( "div.ngameplayers" ).replaceWith( g_gameplayershtml );
		nfixHole(g_game.activehole);
	}
	
	function newGame( )  // g_selcourse must be valid
	{
		var gamedots = [];
		var trashdots = [];
		var score = [];
		var trash = [];
		var partners = [];
		var players = [];
		var boxorder= [];
		var carry = [];		

		var thetrash = { 'poley':false, 'sandy':false, 'greeny':false, 'putts':2, 'strappy':false};
		for(var i=0;i<18;i++)
		{
			trashdots[i] = 0;
			score[i] = g_courses[g_selcourse].par[i];
			trash[i] = thetrash;
			gamedots[i] = 0;
			partners[i] = new Array();
			boxorder[i] = new Array();
			carry[i] = new Array();
			carry[i][0] = 0;
			carry[i][1] = 0;
			carry[i][2] = 0;
			carry[i][3] = 1;
	//		carry[i] = [0,0,0,1];
			for(j=0;j<3;j++)
				boxorder[i][j] = j;
				
		}
		var theplayer = { 'named':'Rodger Schuermann', 'hindex':1, 'score':score, 'trashdots':trashdots, 'trash':trash, 'gamedots': gamedots };
		for(var i=0;i<g_selplayers.length;i++)
		{
			var cloneOfA = JSON.parse(JSON.stringify(theplayer));
			cloneOfA.named = g_players[g_selplayers[i]].named;
			cloneOfA.hindex = g_players[g_selplayers[i]].hindex;
			players.push(cloneOfA);
		}

		g_game = { 'id':'', 'gname':'rws 12-1-16', 'course':g_selcourse,'gametype':g_selGameType, 'activehole':1, 'completedHole':1, 'basehdcp':1, 'players':players, 'partners': partners, 'boxorder': boxorder, 'carry':carry};
//		console.log(g_game);
		g_selplayers = [];		
		htmlGame();
		sessionStorage.setItem('game', JSON.stringify(g_game));
		g_gameid = null;
		g_thegame = null;
		putTheGame();
	}

			
// course change ----------------------------------------
	function onChgCourse(e, id)
	{
		var i = parseInt(id.substr(2));
		g_selcourse = i;
//		console.log( 'id='+id+' i='+i);
	}
	
	function onCourseChanged()
	{
		$('#chgCourseModal').modal('hide');
		if(g_from=='game')
		{
			hideHome();
			$('.navbar').css('top', '-102px');
			htmlPlayers();
			$('#nselectPlayers').show();
		}
		else
		{
			g_hdcpCourse = g_selcourse;
			htmlHandicap();
			hideHome();
			hideHoles();
			$('#handicaps').show();
		}
	}
	function htmlCourses() {	
		var myhtml = '<div class="courses">';
        for (var i = 0; i < g_courses.length; i++) {
			var object = g_courses[i];
			var check = "";
			if(i==g_selcourse)
				check = " checked";
			myhtml += '<input type="radio"'+check+' name="rd0" data-rwschk="'+g_courses[i].Name+'" id="cc'+i+'"/>';
		}
		myhtml += '</div>';
		$( "div.courses" ).replaceWith( myhtml );
		for (var i = 0; i < g_courses.length; i++) 
			$("#cc"+i).rwschk({'min_width':'260px', 'onChange':onChgCourse});		
		sessionStorage.setItem('courses', JSON.stringify(g_courses));
	}

		
	function showGame() {
		if(g_selplayers.length<2){
			alert("Must have at least 2 players!");
			return;
		}
		$('.navbar').css('top', '0px');
		$('#nselectPlayers').hide();
		if(g_selplayers.length>2)
		{
			showHome(true);
			htmlSelGameType(); 
			$('#selGameType').modal('show');
		}
		else
		{
			g_selGameType = GT_NONE;
			hideHome();
			newGame();
			$('#ngame').show();
			$('#handicaps').hide();
		}
	}



// game stuff -----------------------------------------------------------------------------	
	function fixPlayerGameInfo(hole)
	{
		var score;
		var holedots;
		for (var i = 0; i < g_game.players.length; i++) {
			var hdcp = getHDCP(g_game.players[i].hindex, g_game.course);
			if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[hole-1]){
				$('#po'+i ).addClass( 'fa-user-plus');
				$('#po'+i ).removeClass( 'fa-user-o' );
//				$('#po'+i).css( 'color','blue');
				$('#po'+i).css( 'color','white');
			}
			else{
				$('#po'+i ).addClass( 'fa-user-o' );
				$('#po'+i ).removeClass( 'fa-user-plus' );
				$('#po'+i).css( 'color','white');
			}
			if(hole >= g_game.completedHole)	{
				score = '-';
				holedots = '-';
			}
			else {
				score = g_game.players[i].score[hole-1];
				holedots = g_game.players[i].trashdots[hole-1]+g_game.players[i].gamedots[hole-1];
			}
			document.getElementById('sc'+i).innerHTML=score;
			document.getElementById('do'+i).innerHTML=holedots;
		}
	}
	
	function setSelHole( sel, hole)
	{
		document.getElementById(sel).innerHTML=hole;
		if(g_game.completedHole == hole)
			$('#'+sel).css( 'color','#ffd700');
		else
			$('#'+sel).css( 'color','white');
	}
	function gameClicked()
	{
		$('.navbar-toggle:visible').click();
//		console.log(g_game);
		if(g_game)
		{
			hideHome();
			g_selcourse = g_game.course;
			nfixHole(g_game.activehole);
//			$('#ngame').show();
			showHoles();
			$('#handicaps').hide();
		}
		else
		{
			g_from = 'game';
			$('#chgCourseModal').modal('show');
		}
	}
	
	function onGameChanged()
	{
		$('#selGameType').modal('hide');
		hideHome();
		newGame();
		showHoles();
		$('#handicaps').hide();
	}

	
	function onChgGameType(e, id)
	{
		var i = parseInt(id.substr(2));
		g_selGameType = i;
//		console.log( 'id='+id+' i='+i);
	}
		
	function htmlSelGameType() {	
		var ckbox = [];
		var myhtml = '<div class="gametypes">';
		myhtml += '<input type="radio" data-rwschk="Coins" name="rd1" id="gt'+GT_COINS+'"/>';
		ckbox.push(GT_COINS);
		if(g_selplayers.length==3)
		{
			myhtml += '<input type="radio" checked  name="rd1" data-rwschk="Pelosi" id="gt'+GT_PELOSI+'"/>';
			ckbox.push(GT_PELOSI);
			myhtml += '<input type="radio"  name="rd1" data-rwschk="Lucky Pierre" id="gt'+GT_LUCKY+'"/>';
			ckbox.push(GT_LUCKY);
		}
		else if(g_selplayers.length==4)
		{
			myhtml += '<input type="radio" checked  name="rd1" data-rwschk="Left-Right" id="gt'+GT_LR+'"/>';
			ckbox.push(GT_LR);
		}
		else
		{
			myhtml += '<input type="radio" checked  name="rd1" data-rwschk="Wolf" id="gt'+GT_WOLF+'"/>';
			ckbox.push(GT_WOLF);

		}
		myhtml += '</div>';
		$( "div.gametypes" ).replaceWith( myhtml );
		for(var i=0;i<ckbox.length; i++)
			$("#gt"+ckbox[i]).rwschk({'min_width':'250px', 'onChange':onChgGameType});
		g_selGameType = ckbox[1];
	}

	

	function calcGameDots()
	{
		var partnerTotal=0;
		var partnerLoScore= 999;
		var fieldTotal=0;
		var fieldLoScore= 999;
		var score,player;
		var field = [];
		var pelosiscores = [];
		var fieldScores = [];
		var min;
		var arrMin=[];
		var arrRem=[];
		var minIndex;

		for(var i=0;i<g_editplayers.length;i++)
		{
			player = g_editpartners.indexOf(i);
			if(player > -1)
			{
				player = g_editpartners[player];
				score = g_editplayers[player].score[g_game.activehole-1];
				var hdcp = getHDCP(g_editplayers[player].hindex, g_game.course);
				if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[g_game.activehole-1])
					score -=1;
				if(score < partnerLoScore)
					partnerLoScore = score;
				partnerTotal += score;
			}
			else
			{
				score = g_editplayers[i].score[g_game.activehole-1];
				var hdcp = getHDCP(g_editplayers[i].hindex, g_game.course);
				if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[g_game.activehole-1])
				{
//					console.log('hdcp='+hdcp+' score='+score);
					score--;
				}
				if(score < fieldLoScore)
					fieldLoScore = score;
				fieldScores.push(score);
				fieldTotal += score;
				field.push(i);
			}
			pelosiscores.push(score);
		}
		if( (g_game.gametype==GT_WOLF)|| (g_game.gametype==GT_COINS))				// wolf
		{
			var curCarry = g_game.carry[g_game.activehole-1];
			var dots = curCarry[DOTS];
			var wdots = curCarry[WOLF];
			dots += 1;	
			wdots += 1;			// dot for this hole
			if(g_editpartners.length==1)	// lone wolf
			{
				dots += 1;
				if(curCarry[BLIND])
					dots += 1;
			}
			if( (g_editpartners.length==0) &&  (g_game.gametype==GT_COINS) )		// just best ball if no partners && COINS
			{
			
				min = Math.min.apply(null, fieldScores);
				minIndex = indexOfMin(fieldScores, min, arrMin, arrRem);
				if(arrMin.length!=1)			// all three the same
				{
					g_editCarry[WOLF] = wdots;
					g_editCarry[DOTS] = dots;
				}
				else
				{
					player = arrMin[0];
					g_editplayers[player].gamedots[g_game.activehole-1] = dots;
					g_editCarry[WOLF] = 0;
					g_editCarry[DOTS] = 0;
				}
				return;
			}

			if(partnerLoScore == fieldLoScore)
			{
				g_editCarry[WOLF] = wdots;
				g_editCarry[DOTS] = dots;
			}
			else if(partnerLoScore < fieldLoScore)
			{
				for(var i=0;i<g_editpartners.length;i++)
				{
					player = g_editpartners[i];
					g_editplayers[player].gamedots[g_game.activehole-1] = dots;
				}
				g_editCarry[WOLF] = 0;
				g_editCarry[DOTS] = 0;
			}
			else
			{
				for(var i=0;i<field.length;i++)
				{
					player = field[i];
					g_editplayers[player].gamedots[g_game.activehole-1] = dots;
				}
				g_editCarry[WOLF] = 0;
				g_editCarry[DOTS] = 0;
			}
		}
		else if(g_game.gametype==GT_LR)				// left-right game
		{
			if(partnerLoScore < fieldLoScore)
			{
				for(var i=0;i<g_editpartners.length;i++)
				{
					player = g_editpartners[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += 1;
				}
			}
			else if(fieldLoScore < partnerLoScore)
			{
				for(var i=0;i<field.length;i++)
				{
					player = field[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += 1;
				}
			}
			if(partnerTotal < fieldTotal)
			{
				for(var i=0;i<g_editpartners.length;i++)
				{
					player = g_editpartners[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += 1;
				}
			}
			else if(fieldTotal < partnerTotal)
			{
				for(var i=0;i<field.length;i++)
				{
					player = field[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += 1;
				}
			}
		}
		else if( (g_game.gametype==GT_PELOSI) || (g_game.gametype==GT_LUCKY))				// Pelosi
		{
			partnerTotal *=2;					// double pelosi total
			if(partnerTotal < fieldTotal)
			{
				for(var i=0;i<g_editpartners.length;i++)
				{
					player = g_editpartners[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += (fieldTotal-partnerTotal);
				}
			}
			else if(fieldTotal < partnerTotal)
			{
				for(var i=0;i<field.length;i++)
				{
					player = field[i];
					g_editplayers[player].gamedots[g_game.activehole-1] += (partnerTotal-fieldTotal);
				}
			}
			if(g_game.gametype==GT_LUCKY)
				return;
			if(g_game.activehole > 17)
				return;
			min = Math.min.apply(null, pelosiscores);
			minIndex = indexOfMin(pelosiscores, min, arrMin, arrRem);
			if(arrMin.length==3)			// all three the same
			{
				g_editBoxOrder[0]  = arrMin[0];
				g_editBoxOrder[1]  = arrMin[1];
				g_editBoxOrder[2]  = arrMin[2];
			}
			else if(arrMin.length==1)									// found 1 min, decide other two
			{
				if(arrRem.length!=2)
					alert('Arf! arrRem.length != 2');
				g_editBoxOrder[0] = minIndex;
				if(pelosiscores[arrRem[0]] < pelosiscores[arrRem[1]])
				{
					g_editBoxOrder[1]  = arrRem[0];
					g_editBoxOrder[2]  = arrRem[1];
				}
				else if(pelosiscores[arrRem[1]] < pelosiscores[arrRem[0]])
				{
					g_editBoxOrder[1]  = arrRem[1];
					g_editBoxOrder[2]  = arrRem[0];
				}
				else
				{
					if(g_game.boxorder[g_game.activehole-1].indexOf(arrRem[0])  <= g_game.boxorder[g_game.activehole-1].indexOf(arrRem[1]) ) {
						g_editBoxOrder[1]  = arrRem[0];
						g_editBoxOrder[2]  = arrRem[1];
					}
					else {
						g_editBoxOrder[1]  = arrRem[1];
						g_editBoxOrder[2]  = arrRem[0];
					}
				}
			}
			else if(arrMin.length==2 )			// 2 mins
			{
				if(arrRem.length != 1 || arrMin.length!=2 )
					alert('Arf! arrRem.length != 1');
				g_editBoxOrder[2] = arrRem[0];
			
				if(g_game.boxorder[g_game.activehole-1].indexOf(arrMin[0])  <= g_game.boxorder[g_game.activehole-1].indexOf(arrMin[1]) ) {
					g_editBoxOrder[0]  = arrMin[0];
					g_editBoxOrder[1]  = arrMin[1];
				}
				else {
					g_editBoxOrder[0]  = arrMin[0];
					g_editBoxOrder[1]  = arrMin[1];
				}
			}
			else
				alert('Arf');
				
		}
	}
	
	function indexOfMin(arr, mymin, arrMin, arrRem) {
		var min = mymin;
		var minIndex = -1;
		for (var i = 0; i < arr.length; i++) {
			if (arr[i] < min) {
				min = arr[i];
				minIndex = i;
			}
			else if (arr[i] == min) {
				if(minIndex == -1)
					minIndex = i;
				arrMin.push(i);
			}
			else 
				arrRem.push(i);
		}
		return minIndex;
	}
	
	function indexOfMinSkipIndex(arr, skipIndex) {
		var min = arr[0];
		if(skipIndex==0)
		min = arr[0];
		var minIndex = 0;
		for (var i = 1; i < arr.length; i++) {
			if (arr[i] < min) {
				minIndex = i;
				min = arr[i];
			}
		}
		return minIndex;
	}
	

	
	function getPlayerTrash()
	{
		var inccarryover = 1;
		for(var i=0;i<g_editplayers.length;i++)
		{
			g_editplayers[i].trashdots[g_game.activehole-1]=0;
			g_editplayers[i].gamedots[g_game.activehole-1]=0;
		}
		for(var i=0;i<g_editplayers.length;i++)
		{
			var putts = g_editplayers[i].trash[g_game.activehole-1].putts;
			if(putts>2)
			{
				for(var j=0;j<g_editplayers.length;j++)
				{
					if(i==j)
						continue;
					g_editplayers[j].trashdots[g_game.activehole-1] += (putts-2);
				}
			}
			if( g_editplayers[i].score[g_game.activehole-1] < g_courses[g_game.course].par[g_game.activehole-1])
				g_editplayers[i].trashdots[g_game.activehole-1] += 1;
			if( g_editplayers[i].score[g_game.activehole-1] < g_courses[g_game.course].par[g_game.activehole-1]-1)
				g_editplayers[i].trashdots[g_game.activehole-1] += 5;
			if(g_editplayers[i].trash[g_game.activehole-1].poley)
				g_editplayers[i].trashdots[g_game.activehole-1] += 1;
			if(g_editplayers[i].trash[g_game.activehole-1].sandy)
				g_editplayers[i].trashdots[g_game.activehole-1] += 1;
			if(g_editplayers[i].trash[g_game.activehole-1].strappy)
				g_editplayers[i].trashdots[g_game.activehole-1] += 1;
			if(g_editplayers[i].trash[g_game.activehole-1].greeny)
			{
				inccarryover=0;
				var curCarry = g_game.carry[g_game.activehole-1];
				g_editCarry[GREENY]=1;
				g_editplayers[i].trashdots[g_game.activehole-1] += curCarry[GREENY];
			}
		}
		return inccarryover;
	}


	function npickPartners()
	{
		g_editpartners = JSON.parse(JSON.stringify(g_game.partners[g_game.activehole-1]));		//		make temp copy of the partners
		g_editBoxOrder = JSON.parse(JSON.stringify(g_game.boxorder[g_game.activehole]));		//		make temp copy of the Boxorder
		g_editCarry = JSON.parse(JSON.stringify(g_game.carry[g_game.activehole]));		//		make temp copy of the carry
		var ckbox = [];
		myhtml = '<div class="nselectThesePartners">';
		var si=0;
		if( (g_game.gametype==GT_WOLF) || (g_game.gametype==GT_LR) || (g_game.gametype==GT_COINS) || (g_game.gametype==GT_LUCKY))			// handle wolf, man-in-middel
		{
			si = ((g_game.activehole-1) % g_game.players.length);
			if ( (g_editpartners.indexOf(si) < 0) && (g_game.activehole==g_game.completedHole) && (g_game.gametype==GT_WOLF) ) 		// pre select wolf
				g_editpartners.push(si);
			for (var i = si; i < g_game.players.length; i++) {
				var wolf="";
				if( (i==si) && (g_game.gametype==GT_WOLF))
					wolf = ' data-wolf="1"';
				var poping=' data-user="1" ';
				var hdcp = getHDCP(g_game.players[i].hindex, g_game.course);
				if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[g_game.activehole-1])
					poping=' data-popping="1"';
				myhtml += '<input type="checkbox" data-rwschk="'+g_game.players[i].named+'"'+wolf+poping+' id="pa'+i+'"/>';
				ckbox.push(i);
			}

			for (var i = 0; i < si; i++) {
				var wolf="";
				var poping=' data-user="1" ';
				var hdcp = getHDCP(g_game.players[i].hindex, g_game.course);
				if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[g_game.activehole-1])
					poping=' data-popping="1"';
				myhtml += '<input type="checkbox" data-rwschk="'+g_game.players[i].named+'"'+wolf+poping+' id="pa'+i+'"/>';
				ckbox.push(i);
			}
			if(g_game.gametype==GT_WOLF)
			{
				var curCarry = g_game.carry[g_game.activehole-1];
				var check = "";
				if(curCarry[BLIND])
					check= " checked";			
				myhtml += '<div style="padding: 0px 0px 0px 0px;"><input type="checkbox"'+check+' data-rwschk="Blind Wolf" id="blind"/>';
			}
		}
		else if( g_game.gametype==GT_PELOSI )		// pelosi, fix box based on prev hole use
		{
			var boxorder = g_game.boxorder[g_game.activehole-1];
//			console.log(boxorder);
			for (var i = 0; i < boxorder.length; i++) {
				var wolf="";
				if( i==1)
				{
					wolf = ' data-pelosi="1"';
					g_editpartners.push(boxorder[i]);
				}
				var poping=' data-user="1" ';
				var hdcp = getHDCP(g_game.players[i].hindex, g_game.course);
				if( (hdcp-g_game.basehcd) >= g_courses[g_game.course].hdcp[g_game.activehole-1])
					poping=' data-popping="1"';
				myhtml += '<input type="checkbox"'+check+' data-rwschk="'+g_game.players[i].named+'"'+wolf+poping+' id="pa'+boxorder[i]+'"/>';
				ckbox.push(i);
			}
		}
		
		myhtml += '</div>';
//		console.log( myhtml );
		$( "div.nselectThesePartners" ).replaceWith( myhtml );
		$("#blind").rwschk({'min_width':'120px'});
		for(var i=0;i<ckbox.length;i++)
			$("#pa"+ckbox[i]).rwschk({'min_width':'270px', 'onChange':onSelPartner});



//----- title -----------------------		
		var seltext;
		if(g_game.gametype == GT_WOLF)
			seltext='<h6 class="modal-title" style="margin: 10px 0px 10px 0px;">Wolf box order - Select partners</h6>';
		if(g_game.gametype == GT_COINS)
			var seltext='<h6 class="modal-title">Select Coin partners</h6>';
		if( (g_game.gametype == GT_WOLF) || (g_game.gametype == GT_COINS))
		{
			curCarry = g_game.carry[g_game.activehole-1];		//		make temp copy of the Carry
			if(curCarry[WOLF])
				seltext += '<h6>('+curCarry[WOLF]+') hole carryover, worth ('+(curCarry[DOTS]+1)+') dots</h6>';
			else
				seltext += '<h6>No carryover. Hole is worth (1) dot</h6>';
		}
		else if(g_game.gametype ==GT_LR)
			seltext='<h6 class="modal-title">Select Left/Right partners</h6>';
		else if(g_game.gametype ==GT_PELOSI)
			seltext='<h6 class="modal-title">Pelosi box order</h6>';
		else if(g_game.gametype ==GT_LUCKY)
			seltext='<h6 class="modal-title">Select who is Lucky Pierre</h6>';
		else if(g_game.gametype ==GT_NONE)
			seltext='';
		else
			seltext='<h6 class="modal-title">Should not happen</h6>';
		myhtml = '<div class="nselPartnerHeader">';
		myhtml += seltext+'</div>';
		$( "div.nselPartnerHeader" ).replaceWith( myhtml );
		for (var i = 0; i < g_game.players.length; i++)
		{
			var index = g_editpartners.indexOf(i)
			if ( index > -1) 
				document.getElementById('pa'+g_editpartners[index]).checked=true;
		}
		setBlindEnable();
	}


	function partnersOK()
	{
		if((g_game.gametype==GT_LUCKY) && (g_editpartners.length==0))
		{
			alert('Someone needs to selected as Lucky Pierre!');
			return;
		}

		if(g_game.gametype==GT_WOLF)
		{
			if(g_editpartners.length==0)
			{
				alert('Someone needs to be the Wolf!');
				return;
			}

			var curCarry = g_game.carry[g_game.activehole-1];
			curCarry[BLIND] = document.getElementById('blind').checked;			
		}

		$('#selectPartnersModal').modal('hide');
		recordGame();
	}

	
	function setBlindEnable()
	{
		if(g_game.gametype == GT_WOLF)
		{
			 if(g_editpartners.length==1)
				document.getElementById("blind").removeAttribute('disabled');
			else
				document.getElementById("blind").setAttribute('disabled', 'disabled');
		}
	}
	
	function onSelPartner(e, id)
	{
		var i = parseInt(id.substr(2));
		if(g_game.gametype==GT_PELOSI)			// cant change Pelosi
		{
			e.preventDefault();
			return;
		}
		var index = g_editpartners.indexOf(i);
		if (index > -1) {
			g_editpartners.splice(index, 1);
			setBlindEnable();
			return;
		}
		if( (g_editpartners.length==1) && (g_game.gametype==GT_LUCKY) )    // only one lucky pierre
		{
			alert('There can be only 1 Lucky Pierre');
			return;
		}
		if( (g_editpartners.length==2) && (g_game.gametype!=GT_COINS) )
		{
//			console.log(document.getElementById(id).checked);
			e.preventDefault();
			alert('Too many partners');
			return;
		}
		g_editpartners.push(i);
		setBlindEnable();
	}

	function fixSummary(summary){
		if(summary==0){		// front side
			for (var i=0; i<g_game.players.length; i++) {
				document.getElementById('ss'+i).innerHTML = g_Scoref[i];
				document.getElementById('sd'+i).innerHTML = g_Dotsf[i];
				var dollars = 0;
				var mydots = g_Dotsf[i];
				for( var j=0;j<g_game.players.length;j++)
				{
					if(i==j)
						continue;
					dollars += (mydots-g_Dotsf[j]);
				}
				document.getElementById('sm'+i).innerHTML = '$'+dollars;
				if(dollars<0)
					$('#sm'+i).css( 'color','red');
				else
					$('#sm'+i).css( 'color','black');
				
			}
			document.getElementById("front9").disabled = true;
			document.getElementById("back9").disabled = false;
			document.getElementById("full18").disabled = false;
		}
		else if(summary==1){	// backside
			for (var i=0; i<g_game.players.length; i++) {
				document.getElementById('ss'+i).innerHTML = g_Scoreb[i];
				document.getElementById('sd'+i).innerHTML = g_Dotsb[i];
				var dollars = 0;
				var mydots = g_Dotsb[i];
				for( var j=0;j<g_game.players.length;j++)
				{
					if(i==j)
						continue;
//					console.log('j='+j+' g_Dotsf[j]='+g_Dotsf[j]);
					dollars += (mydots-g_Dotsb[j]);
				}
				document.getElementById('sm'+i).innerHTML = '$'+dollars;
				if(dollars<0)
					$('#sm'+i).css( 'color','red');
				else
					$('#sm'+i).css( 'color','black');
			}
			document.getElementById("front9").disabled = false;
			document.getElementById("back9").disabled = true;
			document.getElementById("full18").disabled = false;
		}
		else{					// 18 holes
			for (var i=0; i<g_game.players.length; i++) {
				document.getElementById('ss'+i).innerHTML = g_Scoreb[i]+g_Scoref[i];
				document.getElementById('sd'+i).innerHTML = g_Dotsb[i]+g_Dotsf[i];
				var dollars = 0;
				var mydots = g_Dotsb[i]+g_Dotsf[i];
				for( var j=0;j<g_game.players.length;j++)
				{
					if(i==j)
						continue;
//					console.log('j='+j+' g_Dotsf[j]='+g_Dotsf[j]);
					dollars += (mydots-(g_Dotsb[i]+g_Dotsf[j]));
				}
				document.getElementById('sm'+i).innerHTML = '$'+dollars;
				if(dollars<0)
					$('#sm'+i).css( 'color','red');
				else
					$('#sm'+i).css( 'color','black');
			}
			document.getElementById("front9").disabled = false;
			document.getElementById("back9").disabled = false;
			document.getElementById("full18").disabled = true;
		}
	}
	
	function frontNineClicked(){
		fixSummary(0);
	}
	
	function backNineClicked(){
		fixSummary(1);
	}
	
	function eigthteenClicked(){
		fixSummary(2);
	}
	
	function tryLogin(){
		var myuser = document.getElementById('reg_username').value;
		var pass = document.getElementById('reg_password').value;
		if(pass=="" || myuser=="")
		{
			htmlLogin();
			return;
		}
		Parse.User.logIn(myuser, pass, {
			success: function(user) {
				alert("yipphee!!!, tryLogin");
				$('#login').modal('hide');				
				g_currentUser = Parse.User.current();			
				document.getElementById('showLogin').innerHTML ="Log Out";
			},
			error: function(user, error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}

	function doLogin(){
		var myuser = document.getElementById('lg_username').value;
		var pass = document.getElementById('lg_password').value;
		Parse.User.logIn(myuser, pass, {
			success: function(user) {
				alert("yipphee!!!, Login");
				$('#login').modal('hide');				
				g_currentUser = Parse.User.current();			
				document.getElementById('showLogin').innerHTML ="Log Out";
			},
			error: function(user, error) {
				alert("Error: " + error.code + " " + error.message);
			}
		});
	}

	function doRegister(){
		var myuser = document.getElementById('reg_username').value;
		var pass = document.getElementById('reg_password').value;
		var passconfirm = document.getElementById('reg_password_confirm').value;
		var email = document.getElementById('reg_email').value;
		var user = new Parse.User();
		user.set("username", myuser);
		user.set("password", pass);
		user.set("email", email);

		user.signUp(null, {
		  success: function(user) {
			alert("yipphee!!!, Register");
			$('#login').modal('hide');
			g_currentUser = Parse.User.current();			
			document.getElementById('showLogin').innerHTML ="Log Out";
		  },
		  error: function(user, error) {
			alert("Error: " + error.code + " " + error.message);
		  }
		});

	}

	
	function doSwitchRegister()
	{
		var myhtml = '<div class="logindiv">';
		myhtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">Register</h4></div>';
		myhtml += '<div class="modal-body"><div class="form-group"><label for="reg_username" class="sr-only">Email address</label><input type="text" class="form-control" id="reg_username" name="reg_username" placeholder="username">';
		myhtml += '</div><div class="form-group"><label for="reg_password" class="sr-only">Password</label><input type="password" class="form-control" id="reg_password" name="reg_password" placeholder="password">';
		myhtml += '</div><div class="form-group"><label for="reg_password_confirm" class="sr-only">Password Confirm</label><input type="password" class="form-control" id="reg_password_confirm" name="reg_password_confirm" placeholder="confirm password">';
		myhtml += '</div><div class="form-group"><label for="reg_email" class="sr-only">Email</label><input type="text" class="form-control" id="reg_email" name="reg_email" placeholder="email"></div>';
		myhtml += '<p style="text-align:center;">Already Registered? <button type="button" class="btn btn-info btn-fill" onClick="tryLogin()" style="width:150px;">Login</button></p></div><div class="modal-footer">';
		myhtml += '<button type="button" class="btn btn-default btn-simple" data-dismiss="modal">Cancel</button><div class="divider"></div><button type="button" class="btn btn-info btn-simple" onClick="doRegister()" >Register</button></div>';
		myhtml +=  '</div>';
		$( "div.logindiv" ).replaceWith( myhtml );
	}
	
	
	function doSwitchForgot()
	{
		var myhtml = '<div class="logindiv">';
		myhtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">Forgot Passowrd</h4>';
		myhtml += '</div><div class="modal-body"><p>When you fill in your registered email address, you will be sent instructions on how to reset your password.</p>';
		myhtml += '<div class="form-group"><label for="fg_email" class="sr-only">Email</label><input type="text" class="form-control" id="fp_email" name="fg_email" placeholder="email"></div>';
		myhtml += '<p style="text-align:center;">Already Registered?<button type="button" class="btn btn-info btn-fill" onClick="htmlLogin()" style="width:200px;">Login</button></p>';
		myhtml += '<p style="text-align:center;"><button type="button" class="btn btn-info btn-fill" onClick="doSwitchRegister()" style="width:200px;">New User?</button></p></div>';
		myhtml += '<div class="modal-footer"><button type="button" class="btn btn-info btn-simple" data-dismiss="modal">Cancel</button><div class="divider"></div>';
		myhtml +=  '<button type="button" class="btn btn-info btn-simple" onClick="doForgot()" >Reset Password</button></div>';
		myhtml +=  '</div>';
		$( "div.logindiv" ).replaceWith( myhtml );
	}
	
	function htmlLogin(){
		var myhtml = '<div class="logindiv">';
		myhtml += '<div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h4 class="modal-title">LogIn</h4>';
		myhtml += '</div><div class="modal-body"><div class="form-group"><label for="lg_username" class="sr-only">Username</label><input type="text" class="form-control" id="lg_username" name="lg_username" placeholder="username">';
		myhtml += '</div><div class="form-group"><label for="lg_password" class="sr-only">Password</label><input type="password" class="form-control" id="lg_password" name="lg_password" placeholder="password">';
		myhtml += '</div><p style="text-align:center;"><button type="button" class="btn btn-info btn-fill" onClick="doSwitchForgot()" style="width:200px;">Forgot Password?</button></p>';
		myhtml += '<p style="text-align:center;"><button type="button" class="btn btn-info btn-fill" onClick="doSwitchRegister()" style="width:200px;">New User?</button></p></div>';
		myhtml += '<div class="modal-footer"><button type="button" class="btn btn-info btn-simple" data-dismiss="modal">Cancel</button><div class="divider"></div>';
		myhtml +=  '<button type="button" class="btn btn-info btn-simple" onClick="doLogin()" >Login</button></div>';
		myhtml +=  '</div>';
		$( "div.logindiv" ).replaceWith( myhtml );
	}

	
	function showLogin(){
		$('.navbar-toggle:visible').click();
		if (g_currentUser){
			Parse.User.logOut();
			g_currentUser = null;
			document.getElementById('showLogin').innerHTML ="Log In";
			return;
		}
		htmlLogin();
		$('#login').modal('show');
	}


	function summaryClicked(){
		$('.navbar-toggle:visible').click();
		if(!g_game)
		{
			alert("No active game!")
			return;
		}
		
		var myhtml = '<div class="summaryhead"><h4 class="modal-title" id="myModalLabel">Game Summary</h4><p>Through ('+g_game.completedHole+') holes.</p></div>';
		$( "div.summaryhead" ).replaceWith( myhtml );

		
		myhtml = '<div class="summary"><table style="width:100%;text-align:center;"><tr><td style="width:40%;"></td>';
		myhtml += '<td style="width:20%;color:blue;font-size: 14px;">Score</td><td style="width:20%;color:blue;font-size: 14px;">Dots</td>'
		myhtml += '<td style="width:20%;color:blue;font-size: 14px;"><l class="fa fa-dollar" /></td></tr>';
		
		g_Dotsf = [];
		g_Dotsb = [];
		g_Scoref = [];
		g_Scoreb = [];
		for (var i = 0; i < g_game.players.length; i++) {
			var Dots = 0;
			var Score =  0;
			var fhole = Math.min(g_game.completedHole, 9);
			for(var j=0;j<fhole; j++)
			{
				Score += g_game.players[i].score[j];
				Dots += (g_game.players[i].trashdots[j]+g_game.players[i].gamedots[j]);
			}
			g_Dotsf.push(Dots);
			g_Scoref.push(Score);
			Dots = 0;
			Score =  0;
			fhole = Math.min(g_game.completedHole, 18);
			for(var j=9;j<fhole; j++)
			{
				Score += g_game.players[i].score[j];
				Dots += (g_game.players[i].trashdots[j]+g_game.players[i].gamedots[j]);
			}
			g_Dotsb.push(Dots);
			g_Scoreb.push(Score);

		}

        for (var i = 0; i < g_game.players.length; i++) {
			var name = g_game.players[i].named.split(" ");
			myhtml += '<tr style="border-bottom:1px solid black"><td style="font-size: 12px;text-align:left;padding-top:10px; padding-bottom:2px">';
			myhtml += '<table><tr><td style="padding-left:0px">'+name[0]+'</td></tr><tr><td style="padding-left:10px">'+name[1]+'</td></tr></table></td>';
			myhtml += '<td style="font-size: 16px;" id="ss'+i+'">0</td><td style="font-size: 16px;" id="sd'+i+'">0</td>';
			myhtml += '<td style="font-size: 16px;" id="sm'+i+'">$0</td></tr>'; 
		}
		myhtml += '</table></div>';
//		console.log(myhtml);
		$( "div.summary" ).replaceWith( myhtml );
		fixSummary(0);
		$('#gameSummary').modal('show');
	}
	
	function newgameClicked(){
		if(g_game)
		{
			if (confirm('Are you sure you want to erase the current game?')) {
				saveGameToUser();
				sessionStorage.removeItem('game');
				g_game = null;
				g_gameid = null;
				g_thegame = null;
				$('#carousel').show();
				$('#blur').show();	
				hideHoles();
				$('#handicaps').hide();
			}
		}
		gameClicked();
	}
	
	function showHome( notFromMenu) {
		if(!notFromMenu)
			$('.navbar-toggle:visible').click();
		$('#carousel').show();
		$('#blur').show();
		hideHoles();
		$('#handicaps').hide();
	}
	function hideHome()
	{
		$('#carousel').hide();
		$('#blur').hide();	
	}
	
	
	function handicapClicked() {
		$('.navbar-toggle:visible').click();
		g_from = 'hdcp';
		g_selcourse = g_hdcpCourse;
		$('#chgCourseModal').modal('show');
	}
	

	
	$('.carousel').carousel({
      interval: 4000
    });
	
	function htmlHandicap() {
		var myhtml = '<div class="players">';
        for (var i = 0; i < g_players.length; i++) {
			var object = g_players[i];
			myhtml += '<div class="row"><div style="padding-left:15px;padding-right:15px;" ><div class="rws-left70"><div class="rws-left">';
			myhtml += object.named;
			myhtml += '</div> <div class="rws-hdc">';
			myhtml += getHDCP( object.hindex, g_hdcpCourse);
			myhtml += '</div></div><div class="rws-updated">';
			myhtml += dateFormat(object.updatedAt, 'm/d/yyyy');
			myhtml += '</div></div></div>';
		}
		myhtml += '</div>';
		$( "div.players" ).replaceWith( myhtml );
		document.getElementById('ch').innerHTML=g_courses[g_hdcpCourse].short_name+' current handicaps';
	}

	function onSelPlayer(e, id)
	{
		var i = parseInt(id.substr(2));
		var index = g_selplayers.indexOf(i);
		if (index > -1) {
			g_selplayers.splice(index, 1);
			return;
		}
		g_selplayers.push(i);
	}
	
	function ncancelPlayers(){
		$('.navbar').css('top', '0px');
		$('#nselectPlayers').hide();
		showHome(true);
	}

	
	function htmlPlayers() {
		var myhtml = '<div class="selectplayers">';
		myhtml += '<div class="scoremenu"><div style="float:left" onClick="ncancelPlayers()">< Cancel</div><div style="float:right" onClick="showGame()">Continue ></div></div>'
		myhtml += '<div style="height:50px" />';
        for (var i = 0; i < g_players.length; i++) {
			var object = g_players[i];
//			myhtml += '<div style="width:320px;margin:auto">';
			myhtml += '<input type="checkbox" data-rwschk="'+object.named+' ('+getHDCP(object.hindex, g_selcourse)+')" id="pp'+i+'" />';
//			myhtml += '</div>';
		}
		myhtml += '</div>';
//		myhtml += '<div class="scoremenu"><div style="float:left" onClick="ncancelPlayers()">Cancel</div><div style="float:right" onClick="showGame()">Continue</div></div>'
		myhtml += '</div>';
		$( "div.selectplayers" ).replaceWith( myhtml );
		for(var i=0;i<g_players.length;i++)
			$("#pp"+i).rwschk({'min_width':'270px', 'margin_set':'5px auto', 'onChange':onSelPlayer});
		$(".scoremenu").css("width", g_scoreMenuWidth);
	}
	
	
	function showHoles()
	{
		$('#ngame').show();
		$('html, body').scrollTop(102);
//		$('html, body').animate({scrollTop: 102}, 500);
	}

	function hideHoles()
	{
		$('#ngame').hide();
		$('html, body').scrollTop(0);
//		$('html, body').animate({scrollTop: 0}, 50);
	}
	
	

	function putTheGame()
	{
		if( !g_thegame){
			var Games = Parse.Object.extend("Games");
			g_thegame = new Games();
		}
		g_thegame.set("thegame", JSON.stringify(g_game));
		g_thegame.save(null, {
			success: function(game) {
				console.log('Game saved with objectId: ' + game.id);
				if(!g_gameid)
					networkSaveGameId( game.id );
			},
			error: function(game, error) {
				console.log('Failed to create new game, with error code: ' + error.message);
			}
		});
	}

	
	
	function ngetPlayerScores(){
		for(var i=0; i<g_editplayers.length; i++)
		{
			g_editplayers[i].score[g_game.activehole-1] = parseInt($('#score'+i).find(".dpui-numberPicker-input")[0].value);
			g_editplayers[i].trash[g_game.activehole-1].putts = parseInt($('#putts'+i).find(".dpui-numberPicker-input")[0].value);
			g_editplayers[i].trash[g_game.activehole-1].strappy = document.getElementById('strappie'+i).checked;
			g_editplayers[i].trash[g_game.activehole-1].sandy = document.getElementById('sandie'+i).checked;
			g_editplayers[i].trash[g_game.activehole-1].greeny = document.getElementById('greenie'+i).checked;
			g_editplayers[i].trash[g_game.activehole-1].poley = document.getElementById('polie'+i).checked;
		}
	}

	
	function nsaveScores(){
		ngetPlayerScores();
		var inccarryover = getPlayerTrash();
		calcGameDots();
		if(g_game.activehole > g_game.completedHole){
			var skipped;
			if( (g_game.activehole - g_game.completedHole) > 1)
				skipped = 'Holes ('+g_game.completedHole+' - '+(g_game.activehole-1)+') were skipped!\n\n';
			else 
				skipped = 'Hole ('+(g_game.activehole-1)+') was skipped!\n\n';
			var res = confirm(skipped+'This will affect carryovers and all scores will be saved as pars.\nNo trash will be saved, and box orders may change!\n\nAre you sure you want to save the current hole?');
			if(!res){
				$('.navbar').css('top', '0px');
				$('#nscores').hide();
				showHoles();
				$('#ngame').show();
				return;
			}
		}
		if( (g_courses[g_game.course].par[g_game.activehole-1]==3) && inccarryover)
			g_editCarry[GREENY] +=1;
		Object.assign(g_game.players, g_editplayers);
		Object.assign(g_game.partners[g_game.activehole-1], g_editpartners);
		Object.assign(g_game.boxorder[g_game.activehole], g_editBoxOrder);
		Object.assign(g_game.carry[g_game.activehole], g_editCarry);
					
		if(g_game.activehole<18)
			g_game.activehole++;
		if(g_game.activehole > g_game.completedHole)
			g_game.completedHole = g_game.activehole;
		sessionStorage.setItem('game', JSON.stringify(g_game));
		putTheGame();
		nfixHole(g_game.activehole);
		$('.navbar').css('top', '0px');
		$('#nscores').hide();
		showHoles();
	}

	function ncancelScores(){
		$('.navbar').css('top', '0px');
		$('#nscores').hide();
		showHoles();
	}
	
	function htmlScores()
	{
		g_editplayers = JSON.parse(JSON.stringify(g_game.players));		//		make temp copy of the players
		var myhtml = '<div class="newscorediv">';
		myhtml += '<div class="scoremenu"><div style="float:left" onClick="ncancelScores()">< Cancel</div><div style="float:right" onClick="nsaveScores()">Save ></div></div>';
		myhtml += '<div style="height:50px" />';

		for(var i=0; i<g_editplayers.length; i++)
		{
			var named = g_editplayers[i].named;
			var itemcolor = " spg";
			for(var j=0;j<10;j+=2)
			{
				if(i==j)
					itemcolor = "";
			}
			myhtml += '<div class="splayeritem'+itemcolor+'"><div class="scontroldiv"><div class="splabel">'+named+'</div><div class="silabel">score</div>';
			myhtml += '<div id="score'+i+'" class="sicontrol"></div><div class="silabel">putts</div><div id="putts'+i+'" class="sicontrol"></div></div><div class="strashdiv" >';
			myhtml += '<input type="checkbox" data-rwschk="polie" id="polie'+i+'"/>';
			myhtml += '<input type="checkbox" data-rwschk="sandie" id="sandie'+i+'"/>';
			myhtml += '<input type="checkbox" data-rwschk="strappie" id="strappie'+i+'"/>';
			myhtml += '<input type="checkbox" data-rwschk="greenie" id="greenie'+i+'"/></div></div>';
		}
		myhtml += '</div>';
		$( "div.newscorediv" ).replaceWith( myhtml );
//		console.log(myhtml);

		for(var i=0; i<g_editplayers.length; i++)
		{
			$('#polie'+i).rwschk();
			$('#sandie'+i).rwschk();
			$('#strappie'+i).rwschk();
			$('#greenie'+i).rwschk();
			dpUI.numberPicker('#score'+i, {start:g_editplayers[i].score[g_game.activehole-1], min: 1});
			dpUI.numberPicker('#putts'+i, {start:g_editplayers[i].trash[g_game.activehole-1].putts, min: 2});
			document.getElementById('polie'+i).checked = g_editplayers[i].trash[g_game.activehole-1].poley
			document.getElementById('sandie'+i).checked = g_editplayers[i].trash[g_game.activehole-1].sandy
			document.getElementById('strappie'+i).checked = g_editplayers[i].trash[g_game.activehole-1].strappy
			document.getElementById('greenie'+i).checked = g_editplayers[i].trash[g_game.activehole-1].greeny
		}
		$(".scoremenu").css("width", g_scoreMenuWidth);
		winReSize();

	}

	
	function ngameClicked()
	{
		if(g_game)
		{
			hideHome();
			g_selcourse = g_game.course;
			nfixHole(g_game.activehole);
			$('#handicaps').hide();
			hideHoles()();
//			$('#ngame').show();
		}
		else
		{
			g_from = 'game';
			$('#chgCourseModal').modal('show');
		}
	}
	
	function nscoresClicked()		// called from ngame current button
	{
		if((g_game.gametype==GT_LUCKY) && (g_editpartners.length==0))
		{
			alert('Someone needs to selected as Lucky Pierre!');
			return;
		}

		if((g_game.gametype==GT_COINS) && (g_editpartners.length==0))
		{
			var res = confirm('No Coin partners?');
			if(!res)
				return;
		}
		
		if(g_game.gametype==GT_WOLF)
		{
			if(g_editpartners.length==0)
			{
				alert('Someone needs to be the Wolf!');
				return;
			}
			if(g_editpartners.length==1)
			{
				var res = confirm( g_game.players[g_editpartners[0]].named+' is the Lone Wolf?');
				if(!res)
					return;
			}

			var curCarry = g_game.carry[g_game.activehole-1];
			curCarry[BLIND] = document.getElementById('blind').checked;			
		}
		if(g_game.gametype==GT_LR)
		{
			if(g_editpartners.length!=2)
			{
				alert('You need to pick 2 partners!');
				return;
			}
		}

		$('.navbar').css('top', '-102px');
		htmlScores();
		hideHoles();
		$('#nscores').show();
	}
	
	function clknH(id) {
		nfixHole(document.getElementById('nh'+id).innerHTML);
	}
	
	function fixTabs()
	{
		var myhtml = '<div class="wholetab" style="color:#fff;">';
		if(g_game.completedHole != g_game.activehole){
			 myhtml += '<div class="navtabdiv"><ul class="nav nav-tabs"><li class="active"><a data-toggle="tab" href="#summary">Summary</a></li><li><a data-toggle="tab" href="#partners">Partners</a></li>';
			 myhtml += '</ul></div><div class="tab-content"><div id="summary" class="tab-pane fade in active"><div class="ngameplayers"></div></div> <div id="partners" class="tab-pane fade">';
			 myhtml += '<div class="modal-header" style="padding:1px 0px 0px 0px;"><div class="nselPartnerHeader"></div></div><div class="nselectThesePartners"></div><div style="padding: 10px;text-align: center;">';
			 myhtml += '<button type="button" class="btn btn-info btn-fill" onClick="nscoresClicked()">Scoring</button></div></div></div></div>';
		}
		else{
			myhtml += '<div class="justpartners"><div class="modal-header" style="padding:0"><div class="nselPartnerHeader"></div></div><div class="nselectThesePartners"></div><div style="padding: 10px;text-align: center;">';
			myhtml += '<button type="button" class="btn btn-info btn-fill" onClick="nscoresClicked()">Scoring</button></div></div></div>';
		}
		$( "div.wholetab" ).replaceWith( myhtml );
//		console.log( myhtml);
	
	}

	
	function nfixHole(hole) {
		if(!hole)
			return;
		g_game.activehole = hole;
		if(g_game.completedHole == hole)
			$('#nh2').css( 'color','white');
		else
			$('#nh2').css( 'color','black');
		var thole = hole;

		document.getElementById('npar').innerHTML = g_courses[g_game.course].par[hole-1];
		document.getElementById('nhdcp').innerHTML = g_courses[g_game.course].hdcp[hole-1];
//		alert(g_courses[g_game.course]);
	    document.getElementById('nh2').innerHTML=hole;
		hole--;
		if(hole<1)
			document.getElementById('nh1').innerHTML="";
		else
			setSelHole( 'nh1', hole)
		hole--;
		if(hole<1)
			document.getElementById('nh0').innerHTML="";
		else
			setSelHole( 'nh0', hole)
		hole+=3;
		if(hole>18)
			document.getElementById('nh3').innerHTML="";
		else
			setSelHole( 'nh3', hole)
		hole++;
		if(hole>18)
			document.getElementById('nh4').innerHTML="";
		else
			setSelHole( 'nh4', hole)
			
		fixTabs();
		if(g_game.completedHole != g_game.activehole){
			$( "div.ngameplayers" ).replaceWith( g_gameplayershtml );
			fixPlayerGameInfo(g_game.activehole);
		}
		npickPartners();

		
		if(g_game.activehole != g_game.completedHole){
			var myhtml = '<div class="navtabdiv"><ul class="nav nav-tabs">';
			myhtml += '<li class="active"><a data-toggle="tab" href="#summary">Summary</a></li>';
			myhtml += '<li><a data-toggle="tab" href="#partners">Partners</a></li>'
			$("#summary").addClass("in active");
			$("#partners").removeClass("in active");
			myhtml += '</ul></div>';
			$( "div.navtabdiv" ).replaceWith( myhtml );
		}
	}
	
	function winReSize() {
//		alert($(".rwswidth").css("margin-left"));
//		alert($(".rwswidth").css("width"));
//var test = $(window).height();
//		alert(test);

//		$(".fixedimg-src").height($(window).height()+60);

		var dw = $(window).width();
		if(dw > 414){
			$(".rwswidth").css("margin-left", Math.round((dw-400)/2)+"px");
			$(".rwswidth").css("width", "414px");
			g_scoreMenuWidth = "414px"
//			$(".scoremenu").css("width", "414px");
		}
		else{
			$(".rwswidth").css("margin-left", "0px");
			$(".rwswidth").css("width", dw+"px");
			g_scoreMenuWidth = dw+"px"
//			$(".scoremenu").css("width", dw+"px");
		}
//		alert(g_scoreMenuWidth);
			
//		alert( 'window.width = '+$(window).width());
//		alert($(".rwswidth").css("margin-left"));
//		alert($(".rwswidth").css("width"));
	}
	
	function getTheGame()
	{
		if(!g_gameid)
			return;
		var Games = Parse.Object.extend("Games");
		var query = new Parse.Query(Games);
		query.equalTo("objectId", g_gameid);		
		query.first({
			success: function(game) {
				console.log('Got network game created with objectId: ' + game.id);
				g_thegame = game;
				g_game = JSON.parse(game.get('thegame'));
				sessionStorage.setItem('game', JSON.stringify(g_game));
				htmlCourses(); 
				hideHome();
				g_selcourse = g_game.course;
				htmlGame();
				$('#ngame').show();
				$('html, body').animate({scrollTop: 102}, 500);
			},
			error: function(game, error) {
				console.log('Failed to get game, with error code: ' + error.message);
			}
		});
	}


	function getNetworkData()
	{
		var Courses = Parse.Object.extend("Courses");
		var query1 = new Parse.Query(Courses);
		query1.ascending("Name");	    	
		query1.find({
		  success: function(results) {
			console.log("Successfully retrieved " + results.length + " courses.");
			g_courses=JSON.parse(JSON.stringify(results));
			htmlCourses();
			var Players = Parse.Object.extend("Players");
			var query = new Parse.Query(Players);
			query.ascending("lname");
					
			query.find({
			  success: function(results) {
				console.log("Successfully retrieved " + results.length + " players.");
				g_players=JSON.parse(JSON.stringify(results));
				sessionStorage.setItem('players', JSON.stringify(g_players));
				getTheGame();
			  },
			  error: function(error) {
				console.log("Error: " + error.code + " " + error.message);
			  }
			});
		  },
		  error: function(error) {
			console.log("Error: " + error.code + " " + error.message);
		  }
		});
	}
	
	
	function initialLoad() {
//		g_game = JSON.parse(sessionStorage.getItem('game'));
		g_courses = JSON.parse(sessionStorage.getItem('courses'));
		g_players = JSON.parse(sessionStorage.getItem('players'));
		if(g_game && g_courses && g_players){
			htmlCourses(); 
			hideHome();
			g_selcourse = g_game.course;
			htmlGame();
			$('#ngame').show();
			$('html, body').animate({scrollTop: 102}, 500);
		}
		else{
			sessionStorage.removeItem('game');
			sessionStorage.removeItem('courses');
			sessionStorage.removeItem('players');
			getNetworkData();
		}
	}
	
	function saveGameToUser(){
		if(!g_currentUser || !g_gameid)
			return;
		var games = [];
		var test = g_currentUser.get("games");
		if(test)
			games = test;
		games.push(g_gameid);
		g_currentUser.set("games", games);
		g_currentUser.save(null, {
			success: function(user) {
				console.log("saveGameToUser success!");
			},
			error: function(user, error) {
				console.log("saveGameToUser error "+error.message);
			} 
		});
		
	}
	
	function networkSaveGameId( id )	{
		if (g_currentUser){
			g_gameid = id;
			g_currentUser.set("thegame", id);
			g_currentUser.save(null, {
				success: function(user) {
					console.log("g_currentUser.save success!");
				},
				error: function(user, error) {
					console.log("g_currentUser.save error "+error.message);
				} 
			});
		}
	}

$(document).ready(function(){

	winReSize();
	g_currentUser = Parse.User.current();
	if (g_currentUser)
	{
		document.getElementById('showLogin').innerHTML ="Log Out";
		g_gameid = g_currentUser.get("thegame");
		console.log( "g_currentUser.get('thegame') = "+ g_currentUser.get("thegame"));
	}
	initialLoad();

	
	$(window).on('resize', function(){
		winReSize();
	});

	$('#showHome').click(function(e) {
		showHome();
		e.preventDefault();
	});
	$('#showLogin').click(function(e) {
		showLogin();
		e.preventDefault();
	});
	$('#gameClicked').click(function(e) {
		gameClicked();
		e.preventDefault();
	});
	$('#summaryClicked').click(function(e) {
		summaryClicked();
		e.preventDefault();
	});
	$('#newgameClicked').click(function(e) {
		newgameClicked();
		e.preventDefault();
	});
	$('#handicapClicked').click(function(e) {
		handicapClicked();
		e.preventDefault();
	});
	
	$('#showDotsDialog').click(function(e) {
		showDotsDialog();
		e.preventDefault();
	});
	$('#addPlayer').click(function(e) {
		$('.navbar-toggle:visible').click();
		alert('Not implimented yet!');
		e.preventDefault();
	});
	$('#addCourse').click(function(e) {
		$('.navbar-toggle:visible').click();
		alert('Not implimented yet!');
		e.preventDefault();
	});
	$('#ngameClicked').click(function(e) {
		$('.navbar-toggle:visible').click();
		ngameClicked();
		e.preventDefault();
	});
//	initialLoad();

});

/*
$(window).scroll(function(e) {
	if(g_ngameactive)
	{
//		oVal = $(window).scrollTop();
//		$('.navbar').css('top', -oVal+'px');
	}
});
*/

