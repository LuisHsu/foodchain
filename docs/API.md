# API

### RESTful

- POST /login: If a username is not existing, system will sign this username up. After the user login successfully, system will put them into waiting room.

Body:

```javascript
{
	"username": <string>,
	"password": <string>,
}
```

Response:

- 200

```javascript
{
	"token": <string>, // Used for socket connection
}

```

- 400:

```javascript
{
	"errorMsg": "Invalid username / password"
}
```

### Socket

Initialize socket connection with `Socket.io({ auth: { token: <token> } })` . The token is received when login.

- Waiting room
    - (Client) preparation

        ```javascript
        {
        	"prepared": <bool>,
        }
        ```

    - (Client) exchange_place

        ```javascript
        {
        	"index": <int>, // intended index
        }
        ```

    - (Server) Launch: Notice all clients to join the game room.

        ```javascript
        {
        	"players": {
                <username>: {
                    "index": <int>,
                    "prepared": <bool>,
                },
                "spectaculars": [<username>]
            }
        }
        ```

    - (Server) player_list_update

        ```javascript
        {
        	"players": {
                <username>: {
                    "index": <int>,
                    "prepared": <bool>,
                },
                "spectaculars": [<username>]
            }
        }
        ```

- Game room
    - (Server)setup: ⇒ pool_update
        1. Card setup: Set the amount of employee card with 1x mark and remove some billboards 
        2. Map setup: Randomly picking up map tile. The amount of map tiles is based on player number.
        3. Filling the bank: Set first bank reserve based on the number of players
        4. Initial order of play: random choose the initial order ⇒ order_decision
        5. Placing first restaurants: One user may pass once ⇒ tile_placement
        6. Setting goals: Each player chooses one bank reserve card without showing to others.
    - (Server) turn_update: Notify turn update. Clients may start the animation of next turn.

        ```javascript
        {
        	"turn": <int>
        }
        ```
    - (Server) setup_map: Notify the map update. If a new map tile added into game, this event will be sent again.

        ```javascript
        {
        	"tiles": [
		        {
			    "position": <position>,
			    "direction": <int>,
			    "tileId": <string>,
			}
                ]
        }
        ```

    - (Server) tiles_placement: Notify when tiles placed

        ```javascript
        {
        	"type": "house" | "garden" | "restaurant" | "marketing",
        	"position": [<position>],
        	"direction": 0~3,
        }
        ```

    - (Server) pool_update: Notify state changes of elements in pool

        ```javascript
        { // An event may contain 1 or more keys defined below
        	"money": <int>,
        	"employees": <structure>,
        	"milestones": {
        		"achieved": {	
        			<milestone_id>: [<username>],
        		},
        		"new": {
        			<milestone_id>: [<username>],
        		}
        	},
        	"houses": {
        		<house_id>: <position>,
        	},
        	"garden": {
        		<garden_id>: <position>,
        	},
        	"ads": {
        		<ad_id>: <position>,
        	}
        }
        ```

    - (Server) player_update: Notify other players state change of a user

        ```javascript
        {
        	<username>: {
        		"coffeeShopAmount": <int>,
        		"shopAmount": <int>,
        		"foods": [<food>],
        		"milestones": [<milestone_id>],
        		"structure": <structure>,
        		"onBeach": <structure>,
        		"advertising": <structure>,
        		"money": <int>,
        	}
        }
        ```

    - (Server) first_restaurant_decision: Notify the next player to determine the location of the first restaurant. Every user may skip only once.

        ```javascript
        {
        	"nextPlayer": <username>,
	        "skippable": <bool>
        }
        ```

    - (Server) history_update: Notify client what happened in the past.

        ```javascript
        {
        	actions: [
        		{
        			"phase": <phase_index>,
        			"player": <username>,
        			// ... other parameters depending on what phase it is
        		}
        	]
        }
        ```

    - (Server) show_up: Display all structures after every player decide their structures.

        ```javascript
        {
        	<username>: {
        		"structures": [<employee>],
        		"openSlots": <int>, // Includes slot counts from Milestones
        	}
        }
        ```

    - (Server) order_decision: Notify selected orders and ask next user to choose working order if any.

        ```javascript
        {
        	"available": [<int>], // maybe empty array
        	"nextPlayer": <username>, // nullable
        	"selected": [<username>, null, null, <username>], // length equals to number of player. May contain null elements.
        }
        ```

    - (Server) dinner_time

        ```javascript
        {
        	"demands": [	
        		{	
        			"seller": <username>, 	
        			"foods": [	
        				{		
        					"type": <food_type>,	
        					"amount": <int>,	
        				},		
        			],
        			"distance": <int>,
        			"pricingOffset": <int>,
        		},
        	],
        	"terminated": <bool>
        	"summary": { // Only if terminated == true
        		<username>: {
        			"balance": <int>,
        			"branches": <int>,
        			// ...
        		}
        	}
        }
        ```

    - (Server) payday

        ```javascript
        {
        	<username>: {
        		"layoffRequest": <int>,
        		"payment": <int>,
        	}
        }
        ```

    - (Server) marketing_campaign

        ```javascript
        {
        	"ads": [
        		{
        			"affectedHouses": [<house_id>],
        			"foods": [<food>],
        		}
        	]
        }
        ```

    - (Client) pick_first_restaurant: This event is only for the first restaurant. Since the second restaurant, please use `put_tile`.

        ```javascript
        {
        	"position": <position>, // Pass undefine if skip
		"direction": 0~3,
        }
        ```

    - (Client) pick_reserve_card

        ```javascript
        {
        	"card": 100 | 200 | 300
        }
        ```

    - (Clinet) lock_structure

        ```javascript
        {
        	"structure": <structure>
        }
        ```

    - (Client) pick_order

        ```javascript
        {
        	"order": <int>, 
        }
        ```

    - (Client) layoff / hiring / training

        ```javascript
        <structure>
        ```
    - (Client) put_tile
        ```javascript
        {
	        "position": [<position>],
	        "direction": 0~3,
	        "tileId": <tileId>,
	        "type": "house" | "garden" | "restaurant" | "marketing",
        }
	```

    - (Client) animation_complete: Notify server that all animations have been completed

        ```javascript
        {
        	"phase": <phase_index>
        }
        ```

    ### Data Structure:

    Defines some common data structure used above

    - structure

    ```javascript
    {
    	<employee_id>: <int>, // amount
    }
    ```

    - position

    ```javascript
    {
    	"xTile": <int>,
    	"yTile": <int>,
    	"xSmall": <int>,
    	"ySamll": <int>,
    }
    ```

    - food

    ```javascript
    {
    	"type": <food_type>,
    	"amount": <int>,
    }
    ```
