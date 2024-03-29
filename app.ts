import express, { Request, Response } from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

type DataType = {
    ms: number
}

const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 18000;
app.use(bodyParser.json());
app.use(cors());

let strLac = "";
let strCell = "";

app.post('/post/', async (req: Request, res: Response) => {
    const { lac, cell } = req.body;
    strLac = `${lac}`;
    strCell = `${cell}`;

    let sqlLacCellAtt = `select ms from v where lac in (${strLac}) and cell in (${strCell}) and att = 1`;
    let sqlLacCellDet = `select ms from v where lac in (${strLac}) and cell in (${strCell}) and att = 0`;
    let sqlLacAtt = `select ms from v where lac in (${strLac}) and att = 1`;
    let sqlLacDet = `select ms from v where lac in (${strLac}) and att = 0`;
    let sqlCellAtt = `select ms from v where cell in (${strCell}) and att = 1`;
    let sqlCellDet = `select ms from v where cell in (${strCell}) and att = 0`;

    try {
        if (lac != 0 && cell != 0) {
            GetData(sqlLacCellAtt, sqlLacCellDet, res);
        } else if (lac != 0 && cell == 0) {
            GetData(sqlLacAtt, sqlLacDet, res);
        } else if (lac == 0 && cell != 0) {
            GetData(sqlCellAtt, sqlCellDet, res);
        }
    } catch (error) {
        console.log(error);        
    }    
});

app.listen(port, () => {
    console.log(`We are live on ${port}`);
});

//Search by LAC/Cell
const FuncLacCell = async (db: any, sqlAtt: any, sqlDet: any, res: Response) => {
    let AttArrMs: any = [];
    let DetArrMs: any = [];
    let a: string = '';
    const resAtt = await db.all(sqlAtt, (err: any, row: { ms: any; }) => {
        if (err) {
            throw err;
        }
        AttArrMs = row;
        a = AttArrMs.map((e: DataType) => e.ms.valueOf());
    });

    const resDet = await db.all(sqlDet, (err: any, row: { ms: any; }) => {
        if (err) {
            throw err;
        }
        DetArrMs = row;
        let b: string = DetArrMs.map((e: DataType) => e.ms.valueOf());
        res.send({ att: a, det: b });
    });
}

const GetData = async (sqlAtt: any, sqlDet: any, res: Response) => {
    const db = new sqlite3.Database('C:/Сайты/Data/vlr.db', (err: any) => {
        if (err) {
            return console.error(err.message);
        }
        console.log('Connected to the in-memory SQlite database.');
    });

    await FuncLacCell(db, sqlAtt, sqlDet, res);
    db.close();
}