module.exports = function Route(app){

players = [];

	app.get('/', function(req, res){
		res.render('index', {});
	});

	//new person entered room
	app.io.route('new_player', function(req){
		req.io.emit('existing_players', {players: players})
		players.push( {name: req.data.name, session_id: req.sessionID, high_score: 0} );
		req.io.broadcast('added_new_player', {name: req.data.name, session_id: req.sessionID});
	});

	//mouse location info sent
	app.io.route('moved_mouse', function(req){
		req.io.broadcast('other_move', {cx: req.data.cx, cy: req.data.cy, session_id: req.sessionID});
	});

	//player left room
	app.io.route('disconnect', function(req){
		// console.log('disconnect', req);
		for( var i = 0; i < players.length; i++)
		{
			if (players[i].session_id == req.sessionID)
			{
				players.splice(i, 1);
			}
		}
		app.io.broadcast('disconnect_user', {session_id: req.sessionID, players: players}); //will need to pass sessionID or another identifier
	});

	//player died and sent score
	app.io.route('send_score', function(req){
		var new_score = req.data.score;
		for( var i = 0; i < players.length; i++)
		{
			if (players[i].session_id == req.sessionID)
			{
				if (players[i].high_score < new_score)
				{
					players[i].high_score = new_score;
					app.io.broadcast('new_score', {players: players});
				}
			}
		}
		req.io.broadcast('player_died', {player_id: req.sessionID});
	});

	//player respawned
	app.io.route('made_new_circle', function(req){
		var cx = req.data.cx;
		var cy = req.data.cy;
		req.io.broadcast('other_new_circle', {cx: cx, cy: cy, player_id: req.sessionID});
	});

	//player picked up powerup
	app.io.route('got_powerup', function(req){
		if ( req.data.powerup_type == 'mini')
		{
			req.io.broadcast('global_powerup', {player_id: req.sessionID, powerup_type: 'mini'});
			req.io.emit('global_powerup', {player_id: 'player', powerup_type: 'mini'});
		}
		if ( req.data.powerup_type == 'reflect')
		{
			app.io.broadcast('global_powerup', {cx: req.data.cx, cy: req.data.cy, powerup_type: 'reflect'})
		}
		if ( req.data.powerup_type == 'big_ball')
		{
			var killer_x = 0;
		    var killer_y = 0;
	    	var loop = true;
	    	while(loop)
	    	{
	    		killer_x = randomNumberBetween(-105, 1105);
		    	killer_y = randomNumberBetween(-105, 905);

		    	if(killer_x > -15 && killer_x < 1015)
		    	{
	    			if (killer_y < -15 || killer_y > 815)
	    			{
	    				loop = false;
	    			}
		    	}
		    	else
		    	{
		    		loop = false;
		    	}
		    	if(killer_y > -15 && killer_y < 815)
		    	{
		    		if(killer_x < -15 || killer_x > 1015)
		    		{
		    			loop = false;
		    		}
		    	}
		    	else
		    	{
		    		loop = false;
		    	}
		    }
	    	var x_diff = killer_x - 500;
			var y_diff = killer_y - 400;
			x_diff /= -100;
			
			if (x_diff > 4.5 || x_diff < -4.5)
			{
				x_diff = x_diff/1.3;
			}
			
			y_diff /= -100;
			if (y_diff > 4.5 || x_diff < -4.5)
			{
				y_diff = y_diff/1.3;
			}

			x_velocity = randomNumberBetween(x_diff-2,x_diff+2);
			y_velocity = randomNumberBetween(y_diff-2,y_diff+2);
			req.io.broadcast('other_powerup', {cx: killer_x, cy: killer_y, x_velocity: x_velocity, y_velocity: y_velocity, powerup_type: 'big_ball'});
		}
	});

	function randomNumberBetween(min, max)
	{
		return Math.random()*(max-min+1) + min;
	};

	//creates new spawn information for an obstacle ball
	function new_balls()
	{
		var killer_x = 0;
	    var killer_y = 0;
    	var loop = true;
    	while(loop)
    	{
    		killer_x = randomNumberBetween(-105, 1105);
	    	killer_y = randomNumberBetween(-105, 905);

	    	if(killer_x > -15 && killer_x < 1015)
	    	{
    			if (killer_y < -15 || killer_y > 815)
    			{
    				loop = false;
    			}
	    	}
	    	else
	    	{
	    		loop = false;
	    	}
	    	if(killer_y > -15 && killer_y < 815)
	    	{
	    		if(killer_x < -15 || killer_x > 1015)
	    		{
	    			loop = false;
	    		}
	    	}
	    	else
	    	{
	    		loop = false;
	    	}
	    }
    	var killer_r = randomNumberBetween(15, 30);
    	var x_diff = killer_x - 500;
		var y_diff = killer_y - 400;
		x_diff /= -100;
		
		if (x_diff > 4.5 || x_diff < -4.5)
		{
			x_diff = x_diff/1.3;
		}
		
		y_diff /= -100;
		if (y_diff > 4.5 || x_diff < -4.5)
		{
			y_diff = y_diff/1.3;
		}

		x_velocity = randomNumberBetween(x_diff-2,x_diff+2);
		y_velocity = randomNumberBetween(y_diff-2,y_diff+2);

		app.io.broadcast('new_ball', {cx: killer_x, cy: killer_y, r: killer_r, x_velocity: x_velocity, y_velocity: y_velocity});
	};

	//creates new spawn information for a powerup
	function new_powerup(){
		var killer_x = 0;
	    var killer_y = 0;
    	var loop = true;
    	while(loop)
    	{
    		killer_x = randomNumberBetween(-105, 1105);
	    	killer_y = randomNumberBetween(-105, 905);

	    	if(killer_x > -15 && killer_x < 1015)
	    	{
    			if (killer_y < -15 || killer_y > 815)
    			{
    				loop = false;
    			}
	    	}
	    	else
	    	{
	    		loop = false;
	    	}
	    	if(killer_y > -15 && killer_y < 815)
	    	{
	    		if(killer_x < -15 || killer_x > 1015)
	    		{
	    			loop = false;
	    		}
	    	}
	    	else
	    	{
	    		loop = false;
	    	}
	    }
    	var killer_r = randomNumberBetween(15, 30);
    	var x_diff = killer_x - 500;
		var y_diff = killer_y - 400;
		x_diff /= -100;
		
		if (x_diff > 4.5 || x_diff < -4.5)
		{
			x_diff = x_diff/1.3;
		}
		
		y_diff /= -100;
		if (y_diff > 4.5 || x_diff < -4.5)
		{
			y_diff = y_diff/1.3;
		}

		x_velocity = randomNumberBetween(x_diff-2,x_diff+2);
		y_velocity = randomNumberBetween(y_diff-2,y_diff+2);

		var num = Math.floor(Math.random()*3)+1;

		app.io.broadcast('new_powerup', {cx: killer_x, cy: killer_y, r: killer_r, x_velocity: x_velocity, y_velocity: y_velocity, num: num});
	}

	setInterval(new_balls, 125);
	setInterval(new_powerup, 8000);
}