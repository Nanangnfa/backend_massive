const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');
const path = require('path')


const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

//koneksi ke database
const db = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root', 
    password: 'ayomondok',
    database: 'db_massive',
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//koneksi ke database
db.connect((err) => {
    if (err) {
        console.error('Koneksi ke database gagal:', err);
    } else {
        console.log('Terhubung ke database');
    }
});

const multer = require('multer');
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Folder tempat menyimpan file
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    },
});

const upload = multer({ storage: storage });

// endpoint untuk register
app.post('/register', upload.single('foto'), (req, res) => {
    const { nama, email, password } = req.body;
    const fotoPath = req.file ? req.file.path : null;

    const sql = 'INSERT INTO users (nama, email, password, foto) VALUES (?, ?, ?, ?)';
    db.query(sql, [nama, email, password, fotoPath], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data ke database:', err);
            res.status(500).json({ message: 'Gagal menyimpan data ke database' });
        } else {
            console.log('Data berhasil disimpan ke database');
            res.json({ message: 'Pendaftaran berhasil!' });
        }
    });
});

// endpoint untuk login
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
    db.query(sql, [email, password], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ message: 'Terjadi kesalahan' });
        } else {
            if (result.length > 0) {
                // Pengguna ditemukan, login berhasil
                res.status(200).json({ message: 'Login berhasil' });
            } else {
                // Pengguna tidak ditemukan, login gagal
                res.status(401).json({ message: 'Email atau password salah' });
            }
        }
    });
});

// endpoint untuk menambahkan produk
app.post('/api/addProduct', upload.single('photo'), (req, res) => {
    const { productName, pricePerKilo, specification, description } = req.body;
    const fileName = req.file ? req.file.originalname : null;

    const sql = 'INSERT INTO tb_produk (nm_produk, harga_produk, spek_produk, desk_produk, foto_produk) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [productName, pricePerKilo, specification, description, fileName], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data ke database:', err);
            res.status(500).json({ message: 'Gagal menyimpan data ke database' });
        } else {
            console.log('Data produk berhasil disimpan ke database');
            res.json({ message: 'Produk berhasil ditambahkan!' });
        }
    });
});

// endpoint untuk menampilkan produk di halaman belanja
app.get('/api/products', (req, res) => {

    const sql = 'SELECT id_produk, nm_produk, harga_produk, foto_produk FROM tb_produk';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ message: 'Terjadi kesalahan' });
        } else {
            res.status(200).json(results);
        }
    });
});

// endpoint untuk daftar toko
app.post('/api/daftar-toko', (req, res) => {
        const { namaToko, noHP, alamat } = req.body;
    
        const sql = 'INSERT INTO tb_toko (nm_toko, no_hp, alamat_toko) VALUES (?, ?, ?)';
        db.query(sql, [namaToko, noHP, alamat], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data toko ke database:', err);
            res.status(500).json({ message: 'Gagal menyimpan data toko ke database' });
        } else {
            console.log('Data toko berhasil disimpan ke database');
            res.json({ message: 'Pendaftaran toko berhasil!' });
        }
        });
    });

    // endpoint untuk menampilkan toko di halaman deskripsi produk
    app.get('/api/toko/:id', (req, res) => {
        const { id } = req.params;
    
    const sql = 'SELECT * FROM tb_toko WHERE id_toko = ?';
    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).json({ message: 'Terjadi kesalahan' });
        } else {
            if (result.length > 0) {
            const toko = result[0];
            res.status(200).json(toko);
            } else {
            res.status(404).json({ message: 'Toko tidak ditemukan' });
            }
        }
        });
    });

    // endpoint untuk menyimpan data pembelian
    app.post('/api/beli-sekarang', (req, res) => {
        const { NamaPembeli, NoHp, Alamat, Catatan } = req.body;
    
        const sql = 'INSERT INTO tb_datapembeli (nama, no_hp, alamat, catatan) VALUES (?, ?, ?, ?)';
        db.query(sql, [NamaPembeli, NoHp, Alamat, Catatan], (err, result) => {
        if (err) {
            console.error('Gagal menyimpan data pembelian ke database:', err);
            res.status(500).json({ message: 'Gagal menyimpan data pembelian ke database' });
        } else {
            console.log('Data pembelian berhasil disimpan ke database');
            res.json({ message: 'Pembelian berhasil diproses!' });
        }
        });
    });
    
app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});


// Keterangan : struktur folder pada server tidak memakai metode 'best practice' dikarenakan ketika diimplementasikan kami mengalami kendala pada saat integrasi antar filenya, jadi kami menyatukan semua komponen dalam 1 file.