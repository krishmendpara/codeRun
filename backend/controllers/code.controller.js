import { exec } from 'child_process';
import fs from 'fs';
import util from 'util';
import * as codeService from '../service/code.service.js'
import codeModel from '../models/code.model.js';
const execPromise = util.promisify(exec);


export const runcode = async (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code || !language) {
            return res.status(400).json({ message: "Code and language are required" });
        }
        let filename, command;
        if (language === 'Python' || language === 'PY' || language === 'py' || language === 'PYTHON' || language === 'python') {
            filename = "temp.py";
            fs.writeFileSync(filename, code);
            command = `python ${filename}`;

        } else if (language === 'JavaScript' || language === 'JS' || language === 'Javascript' || language === 'js' || language === 'JAVASCRIPT' || language === 'javascript') {
            filename = "temp.js";
            fs.writeFileSync(filename, code);
            command = `node ${filename}`;
        } else {
            return res.status(400).json({ message: "Invalid language" });
        }
        const start = Date.now();
        const { stdout } = await execPromise(command);
        const end = Date.now();
        const executionTime = end - start;


        fs.unlinkSync(filename);
        return res.status(200).json({ output: stdout, executionTime: `${executionTime} ms` });

    } catch (err) {
        return res.status(500).json({ message: err.stderr || err.message });
    }

}


export const saveCode = async (req, res) => {
    try {
        const { code, language, output,fileName, error, executionTime } = req.body;
        const user = req.user?.id;

        const newCode = await codeService.savecode({
            code,
            language,
            fileName,
            user,
            output,
            error,
            executionTime
        });

        res.status(201).json(newCode);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });


    }
}


export const getSubmissions = async (req, res) => {

    try {
        const codes = await codeService.getAllSubmissions()
        res.status(200).json(codes);

    } catch (err) {
        res.status(500).json({ message: err.message });

    }
}

export const getSubmissionById = async (req, res) => {

    try {
        const { id } = req.params;
        const code = await codeService.getSubmissionById(id);
        if (!code) {
            return res.status(404).json({ message: "Code not found" });
        }
        res.status(200).json(code);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}


export const deleteSubmissionById = async (req, res) => {

    try {
        const { id } = req.params;
        await codeModel.findByIdAndDelete(id);
        res.status(200).json({ message: "Code deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}