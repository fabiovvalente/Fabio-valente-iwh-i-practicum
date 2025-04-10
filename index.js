require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const PRIVATE_APP_ACCESS = process.env.PRIVATE_APP_ACCESS;

// ROTA 1 – Página inicial com listagem dos objetos customizados
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
            title: 'Lista de Objetos Customizados',
            data
        });
    } catch (error) {
        console.error('Erro ao buscar objetos:', error.response?.data || error.message);
        res.status(500).send('Erro ao buscar dados.');
    }
});

// ROTA 2 – Página com formulário para criar ou atualizar objeto
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
        console.error('Erro ao buscar objeto para edição:', error.response?.data || error.message);
        res.status(500).send('Erro ao buscar objeto para edição.');
    }
});

// ROTA 3 – Submissão para criar ou atualizar objeto
app.post('/update-cobj', async (req, res) => {
    const objectTypeId = '2-43140771';
    const { id, name, marca, modelo } = req.body;

    if (!name || !marca || !modelo) {
        return res.status(400).send('Todos os campos são obrigatórios.');
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
            // Atualiza objeto existente
            const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}/${id}`;
            await axios.patch(url, data, { headers });
        } else {
            // Cria novo
            const url = `https://api.hubapi.com/crm/v3/objects/${objectTypeId}`;
            await axios.post(url, data, { headers });
        }

        res.redirect('/');
    } catch (error) {
        console.error('Erro ao criar/atualizar objeto:', error.response?.data || error.message);
        res.status(500).send('Erro ao criar/atualizar objeto.');
    }
});

// Inicializa o servidor
app.listen(3000, () => console.log('Listening on http://localhost:3000'));