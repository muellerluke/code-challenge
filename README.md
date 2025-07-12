# Code Challenge
## Getting Started
First, create the `.env` file at the root of the project by copying over the variables from the `.env.example` file.
Finally, run the following command to start the server
```
npm run start
```

Note: You will need to be using node 18+ because I used the native fetch included.

## Helpful Links
* [Star Wars API ](https://swapi.dev/)
* [express.js](https://expressjs.com/)

## Details
* I want to make sure you can set up a basic server, interact with an API, and handle a couple of edge cases. Mostly I just want to see how you code, and how you think about problems.
* To begin, fork this repo and push all of your commits to the fork.
* Don't spend more than a couple of hours on this. There's no hard time limit, but this isn't intended to take up your whole day.
* Don't over-engineer. This is a coding challenge, not a production application. Write clean code, but I don't need a full infrastructure - just provide the documented requirements.
* I don't care if it's in JavaScript or TypeScript. You won't win any "points" choosing one over the other. Just do what you're comfortable with.
* Folder structure - If you want to do this all in one file, great. Add a comment at the top of the file telling me how you would structure things in a larger scale project. If you want to do a full folder structure, great. Just explain your structure in your .README.
* Please provide a sentance or two on how to start your server in your .README.
* Reach out with any questions - this isn't intended to be a gotcha. We're happy to help.

## Task
* You're going to make an express server that interacts with the Star Wars API (link above). You'll be using the "People" endpoint and the "Planets" endpoint.
* Your server should expose the following 2 endpoints:
```
/people
/planets
```
*  The people endpoint must return all people (the SWAPI endpoint is paginated), and must take an optional query param "sortBy" that allows the array to be sorted by 'name', 'height', or 'mass' (Make the default sort 'name'). Just return the data in the same format that the API returns it, just no longer paginated.
 
*  The planets endpoint must return all planets but we would like the residents field on each planet to be replaced with the resident's full name, instead of the default from SWAPI which is links to each resident. Don't worry about sorting. This is obviously going to take some time due to all the requests you're making to SWAPI. See if you can make it efficient!
    * The default response looks like this:
    ```
	[
		{
			"name": "Alderaan",
			"rotation_period": "24",
			"orbital_period": "364",
			"diameter": "12500",
			"climate": "temperate",
			"gravity": "1 standard",
			"terrain": "grasslands, mountains",
			"surface_water": "40",
			"population": "2000000000",
			"residents": [
				"https://swapi.dev/api/people/5/",
				"https://swapi.dev/api/people/68/",
				"https://swapi.dev/api/people/81/"
			],
			"films": [
				"https://swapi.dev/api/films/6/",
				"https://swapi.dev/api/films/1/"
			],
			"created": "2014-12-10T11:35:48.479000Z",
			"edited": "2014-12-20T20:58:18.420000Z",
			"url": "https://swapi.dev/api/planets/2/"
		},
		{
			"name": "Yavin IV",
			"rotation_period": "24",
			...
		},
		...
	]
    ```
    * Your endpoint to return planet residents must look something like this:
    ```
	[
		{
			"name": "Alderaan",
			"rotation_period": "24",
			"orbital_period": "364",
			"diameter": "12500",
			"climate": "temperate",
			"gravity": "1 standard",
			"terrain": "grasslands, mountains",
			"surface_water": "40",
			"population": "2000000000",
			"residents": [
				"Leia Organa",
				"Bail Prestor Organa",
				"Raymus Antilles"
			],
			"films": [
				"https://swapi.dev/api/films/6/",
				"https://swapi.dev/api/films/1/"
			],
			"created": "2014-12-10T11:35:48.479000Z",
			"edited": "2014-12-20T20:58:18.420000Z",
			"url": "https://swapi.dev/api/planets/2/"
		},
		{
			"name": "Yavin IV",
			"rotation_period": "24",
			...
		},
		...
	]
    ```
