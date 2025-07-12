const express = require('express');
const app = express();
const dotenv = require('dotenv');
const NodeCache = require( "node-cache" );

const myCache = new NodeCache();
dotenv.config();

/*
Currently, everything is in one file. For a larger scale project, I would likely add a service file that handles the logic for fetching data from the SWAPI.
I would add controllers that would be responsible for logic such as sorting, validation, and caching.
If necessary, I would also add middleware files to handle things like rate limiting (if custom logic is needed), logging (if custom logic is needed), and error handling.
Most projects I work on have a standard structure that looks like this:

/src
    /controllers (business logic)
    /services (fetching data from APIs or database)
    /utils (helper functions)
    /middleware (rate limiting, logging, error handling, authentication, authorization, etc.)
    /routes (defining the routes for the API)
    /models (database models if an ORM is used)
/tests
.env
package.json

I like keeping things as simple as possible.
*/


const { PORT = 3000 } = process.env;

const VALID_SORT_BY = ['name', 'height', 'mass'];
const VALID_SORT_ORDER = ['asc', 'desc'];

// Utility functions
const fetchAllPages = async (endpoint) => {
    const initialRequest = await fetch(`${process.env.SWAPI_HOST}/api/${endpoint}?page=1`);
    const initialData = await initialRequest.json();
    const count = initialData.count;
    let results = initialData.results;

    // Fetch remaining pages in parallel
    const remainingPages = Math.ceil(count / process.env.SWAPI_PAGE_SIZE) - 1;
    if (remainingPages > 0) {
        const requests = Array.from({ length: remainingPages }, (_, i) => 
            fetch(`${process.env.SWAPI_HOST}/api/${endpoint}?page=${i + 2}`)
        );
        const responses = await Promise.all(requests);
        const data = await Promise.all(responses.map(response => response.json()));
        results = [...results, ...data.map(page => page.results).flat()];
    }

    return results;
};

// going with this approach 
const fetchResidentsWithErrorHandling = async (planets) => {
    // Flatten all resident URLs with planet indices
    const allResidentUrls = planets.flatMap((planet, planetIndex) => 
        planet.residents.map(url => ({ planetIndex, url }))
    );
    
    // Fetch all residents in parallel with error handling
    const residentPromises = allResidentUrls.map(async ({ planetIndex, url }) => {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                console.warn(`Failed to fetch resident: ${url}`);
                return { planetIndex, name: 'Unknown' };
            }
            const data = await response.json();
            return { planetIndex, name: data.name };
        } catch (error) {
            console.warn(`Error fetching resident ${url}:`, error.message);
            return { planetIndex, name: 'Unknown' };
        }
    });

    const residentResults = await Promise.all(residentPromises);
    
    // Group residents by planet
    const residentsByPlanet = residentResults.reduce((acc, { planetIndex, name }) => {
        if (!acc[planetIndex]) acc[planetIndex] = [];
        acc[planetIndex].push(name);
        return acc;
    }, {});

    // Update planets with resident names
    return planets.map((planet, index) => ({
        ...planet,
        residents: residentsByPlanet[index] || []
    }));
};

/*
    Treating this as a dynamic API, so we'll assume the count could change
    However, the information we return doesn't have to be immediately accurate. 
    Thus, we can cache all the people and invalidate the cache every 5 minutes.
*/
app.get('/people', async (req, res) => {
    try {
        const sortBy = req.query.sortBy || 'name';
        const sortOrder = req.query.sortOrder || 'asc';

        // validate query params
        if (!VALID_SORT_BY.includes(sortBy)) {
            return res.status(400).json({ error: 'Invalid sortBy parameter' });
        }

        if (!VALID_SORT_ORDER.includes(sortOrder)) {
            return res.status(400).json({ error: 'Invalid sortOrder parameter' });
        }

        // check for data in cache
        let people = myCache.get('PEOPLE') || [];
        if (people.length === 0) {
            people = await fetchAllPages('people');
            myCache.set('PEOPLE', people, 300); // 5 minutes
        }

        // sort the data
        people = people.sort((a, b) => {
            if (sortOrder === 'asc') {
                return a[sortBy].localeCompare(b[sortBy]);
            }
            return b[sortBy].localeCompare(a[sortBy]);
        });

        // return the data
        res.json({
            count: people.length,
            results: people,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// basically the same thing as above, but just need to fetch residents after retrieving the planets
app.get('/planets', async (req, res) => {
    try {
        // check for data in cache
        let planets = myCache.get('PLANETS') || [];
        if (planets.length === 0) {
            planets = await fetchAllPages('planets');
            planets = await fetchResidentsWithErrorHandling(planets);
            myCache.set('PLANETS', planets, 300); // 5 minutes
        }

        // return the data
        res.json({
            count: planets.length,
            results: planets,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});