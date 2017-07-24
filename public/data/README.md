## Datas
|table name| items(type) | source |
|----------|-------------|--------|
| pig-user | user(S,HASH), password(S) | dynamodb(./lib/connect.js)|
|pig-notification| user(S,range), area-id(S,HASH), timespan-id(S,LSI), threshold(N)|dynamodb(./lib/connect.js)
| pigArea | see note 1., 2. | pig-area.js (./lib/create-area.js) |
| pigTimespan | [] |pig-timespan |
| pigCity | see note 1., 3.| area-county.js (./lib/create-area.js) |
| pigCounty | see note 1., 4.| area-county.js (./lib/create-area.js) |
| pigStop | see note 1., 5.| area-county.js (./lib/create-area.js) |

0. about id
	* city-id: AreaN, N=1,2,3,...
	* county-id: CN, N=1,2,3,...
	* stop-id: [0-9A-Z]{5}
1. pig-area.json
	
	```
	{
		<stop-id, type = string>:
			{
				"city": <city name, type = string>,
				"stop": <stop name, type = string>,
				"addr": <stop address, type = string>
			}
	},
	{
		<stop-id, type = string>:
			{
				"city": <city name, type = string>,
				"stop": <stop name, type = string>,
				"addr": <stop address, type = string>
			}
	},...	
	```


2. pig-city.json

	```
	{
		<city-id, type = string>: <city name, type = string>,
		<city-id, type = string>: <city name, type = string>,
		...		
	} 
	```

3. pig-county.json

	```
	{
		<city-id, type = string>: 
		{
			<county-id, type = string>: <county name, type = string>,
			<county-id, type = string>: <county name, type = string>,
			...	
		},
		<city-id, type = string>: 
		{
			<county-id, type = string>: <county name, type = string>,
			<county-id, type = string>: <county name, type = string>,
			...	
		},
		...
	} 
	```
	
3. pig-stop.json

	```
	{
		<county-id, type = string>: 
		{
			<stop-id, type = string>:
			{
				"name": <stop name, type = string>,
				"addr": <stop name, type = string>
			},
			<stop-id, type = string>:
			{
				"name": <stop name, type = string>,
				"addr": <stop name, type = string>
			},
			...
		},
		<county-id, type = string>: 
		{
			<stop-id, type = string>:
			{
				"name": <stop name, type = string>,
				"addr": <stop name, type = string>
			},
			<stop-id, type = string>:
			{
				"name": <stop name, type = string>,
				"addr": <stop name, type = string>
			},
			...
		},
		...
	} 
	```