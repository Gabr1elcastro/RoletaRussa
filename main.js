/*
Importa módulos do Electron:
'app': Gerencia o ciclo de vida da aplicação
'BroswerWindow': Cria e gerencia janelas do navegador
'Menu': Cria menus nativos
'ipcMain': Permite comunicação entre processos  
*/
const { app, BrowserWindow, Menu, ipcMain } = require('electron');


/*
Importa módulos adicionais:
'path': Fornece utilitários para trabalhar com caminhos de arquivos e diretórios.
'mariadb': Fornece interface para conexão com banco de dados MariaDB.
*/
const path = require('path');
const mariadb = require('mariadb');

/*
Função createDatabaseIfNotExists:
Cria uma conexão inicial sem especificar um banco de dados.
Executa a consulta SQL para criar o banco de dados se ele não existir.
Fecha a conexão após a operação.
*/
async function createDatabaseIfNotExists() {
    let conn;
    try {
        conn = await mariadb.createConnection({
            host: 'localhost',
            user: 'root',
            password: ''
        });
        await conn.query(`CREATE DATABASE IF NOT EXISTS electronlearn`);
    } catch (err) {
        console.error('Erro ao criar o banco de dados:', err);
    } finally {
        if (conn) conn.end();
    }
}

//Configuração da conexão com MariaDB
const pool = mariadb.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'electronlearn',
    connectionLimit: 5
});

/*
Define a estrutura do menu:
Cada item do menu tem um label (rótulo) e pode ter um accelerator (atalho de teclado).
Submenu Arquivo: Contém opções como Novo, Abrir, Salvar, e Sair.
Submenu Editar: Contém opções como Desfazer, Refazer, Recortar, Copiar, Colar, e Selecionar Tudo.
Submenu Visualizar: Contém opções como Recarregar, Alternar Tela Cheia, e Ferramentas de Desenvolvedor.
Submenu Janela: Contém opções como Minimizar e Fechar.
Submenu Ajuda: Contém opção para abrir a documentação do Electron.
Cria o menu a partir do template e o define como menu da aplicação.
*/
function criarMenu() {
    const template = [
        {
            label: 'Arquivo',
            submenu: [
                {
                    label: 'Novo',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        console.log('Novo arquivo');
                    }
                },
                {
                    label: 'Abrir',
                    accelerator: 'CmdOrCtrl+O',
                    click: () => {
                        console.log('Abrir arquivo');
                    }
                },
                {
                    label: 'Salvar',
                    accelerator: 'CmdOrCtrl+S',
                    click: () => {
                        console.log('Salvar arquivo');
                    }
                },
                { type: 'separator' },
                {
                    label: 'Sair',
                    accelerator: 'CmdOrCtrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'Editar',
            submenu: [
                { label: 'Desfazer', accelerator: 'CmdOrCtrl+Z', role: 'undo' },
                { label: 'Refazer', accelerator: 'Shift+CmdOrCtrl+Z', role: 'redo' },
                { type: 'separator' },
                { label: 'Recortar', accelerator: 'CmdOrCtrl+X', role: 'cut' },
                { label: 'Copiar', accelerator: 'CmdOrCtrl+C', role: 'copy' },
                { label: 'Colar', accelerator: 'CmdOrCtrl+V', role: 'paste' },
                { label: 'Selecionar Tudo', accelerator: 'CmdOrCtrl+A', role: 'selectall' }
            ]
        },
        {
            label: 'Visualizar',
            submenu: [
                { label: 'Recarregar', accelerator: 'CmdOrCtrl+R', role: 'reload' },
                { label: 'Alternar Tela Cheia', accelerator: 'F11', role: 'togglefullscreen' },
                { label: 'Ferramentas de Desenvolvedor', accelerator: 'Alt+CmdOrCtrl+I', role: 'toggledevtools' }
            ]
        },
        {
            label: 'Janela',
            role: 'window',
            submenu: [
                { label: 'Minimizar', accelerator: 'CmdOrCtrl+M', role: 'minimize' },
                { label: 'Fechar', accelerator: 'CmdOrCtrl+W', role: 'close' }
            ]
        },
        {
            label: 'Ajuda',
            role: 'help',
            submenu: [
                {
                    label: 'Documentação',
                    click: async () => {
                        const { shell } = require('electron');
                        await shell.openExternal('https://electronjs.org');
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}


/*
Função assíncrona para configurar o banco de dados:
'let conn': Declara uma variável para a conexão do banco de dados.
'conn = await pool.getConnection()': Obtém uma conexão do pool.
'await conn.query(...)': Executa a consulta SQL para criar a tabela usuarios se ela não existir.
Bloco 'catch': Captura e exibe erros de configuração.
Bloco 'finally': Libera a conexão de volta ao pool.
*/
async function setupDatabase() {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                idade INT
            )
        `);
    } catch (err) {
        console.error('Erro ao configurar a base de dados:', err);
    } finally {
        if (conn) conn.release();
    }
}

/*
Função para criar e carregar a janela principal da aplicação:
'const janela = new BrowserWindow(...)': Cria uma nova janela do navegador com largura e altura especificadas.
'webPreferences': Configura preferências da web.
'preload': Define o caminho para o script de preload.
'nodeIntegration': Permite a integração do Node.js.
'contextIsolation': Desativa o isolamento de contexto.
'janela.loadFile('index.html')': Carrega o arquivo index.html na janela.
*/
function carregar_janela() {
    const janela = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    janela.loadFile('index.html');
}

/*
Executa quando a aplicação está pronta:
Chama as funções para carregar a janela, criar o menu e configurar o banco de dados.
*/
app.whenReady().then( async () => {
    await createDatabaseIfNotExists();
    await setupDatabase();
    carregar_janela();
    criarMenu();
});

/*Evento IPC para adicionar um usuário:
'ipcMain.on('add-user', async (event, user) => {': Escuta o evento add-user.
Obtém uma conexão do pool e insere um usuário no banco de dados.
Chama sendUserList para enviar a lista atualizada de usuários.
*/
ipcMain.on('add-user', async (event, user) => {
    let conn;
    try {
        conn = await pool.getConnection();
        await conn.query('INSERT INTO usuarios (nome, email, idade) VALUES (?, ?, ?)', [user.nome, user.email, user.idade]);
        sendUserList(event.sender);
    } catch (err) {
        console.error('Erro ao inserir usuário:', err);
    } finally {
        if (conn) conn.release();
    }
});

/*
Evento IPC para obter a lista de usuários:
'ipcMain.on('get-users', (event) => {': Escuta o evento get-users.
Chama 'sendUserList' para enviar a lista de usuários ao remetente do evento.
*/
ipcMain.on('get-users', (event) => {
    sendUserList(event.sender);
});

/*
Função assíncrona para enviar a lista de usuários:
Obtém uma conexão do pool e executa uma consulta para buscar todos os usuários.
Envia a lista de usuários ao remetente do evento.
*/
async function sendUserList(sender) {
    let conn;
    try {
        conn = await pool.getConnection();
        const rows = await conn.query('SELECT * FROM usuarios');
        sender.send('user-list', rows);
    } catch (err) {
        console.error('Erro ao buscar usuários:', err);
    } finally {
        if (conn) conn.release();
    }
}

/*
Fecha a aplicação quando todas as janelas são fechadas:
'if (process.platform !== 'darwin') {': Se a plataforma não for macOS (darwin), fecha a aplicação.
*/
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

/*
Reabre a janela principal quando o ícone da aplicação é clicado:
'if (BrowserWindow.getAllWindows().length === 0) {': Se não houver janelas abertas, carrega a janela principal.
*/
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        carregar_janela();
    }
});