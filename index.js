require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// ROUTE 1 – Homepage with list of custom objects
app.get('/', async (req, res) => {
    const objectTypeId = '2-43140771';
    const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}?properties=name,marca,modelo`;

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        const data = response.data.results || [];

        res.render('homepage', {
            title: 'Custom Objects List',
            data
        });
    } catch (error) {
        console.error('Error fetching objects:', error.response?.data || error.message);
        res.status(500).send('Error fetching data.');
    }
});

// ROUTE 2 – Form page to create or update object
app.get('/update-cobj', async (req, res) => {
    const objectTypeId = '2-43140771';
    const id = req.query.id;

    if (!id) {
        return res.render('updates', { item: null });
    }

    const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}/${id}?properties=name,marca,modelo`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.get(url, { headers });
        res.render('updates', { item: response.data });
    } catch (error) {
        console.error('Error fetching object for editing:', error.response?.data || error.message);
        res.status(500).send('Error fetching object for editing.');
    }
});

// ROUTE 3 – Submit form to create or update object
app.post('/update-cobj', async (req, res) => {
    const objectTypeId = '2-43140771';
    const { id, name, marca, modelo } = req.body;

    if (!name || !marca || !modelo) {
        return res.status(400).send('All fields are required.');
    }

    const data = {
        properties: { name, marca, modelo }
    };

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try {
        if (id) {
            // Update existing object
            const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}/${id}`;
            await axios.patch(url, data, { headers });
        } else {
            // Create new object
            const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}`;
            await axios.post(url, data, { headers });
        }

        res.redirect('/');
    } catch (error) {
        console.error('Error creating/updating object:', error.response?.data || error.message);
        res.status(500).send('Error creating/updating object.');
    }
});

// Start server
app.listen(3000, () => console.log('Listening on http://localhost:3000'));