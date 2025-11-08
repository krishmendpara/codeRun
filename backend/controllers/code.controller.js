import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';
import * as codeService from '../service/code.service.js';
import codeModel from '../models/code.model.js';

const execPromise = util.promisify(exec);

/**
 * Run code and return output
 * Supports Python (with matplotlib graphs) and JavaScript
 */
export const runcode = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({
                message: "Code and language are required"
            });
        }

        let filename, command;
        const timestamp = Date.now();

        // Normalize language input
        const lang = language.toLowerCase();

        if (lang === 'python' || lang === 'py') {
            filename = `temp_${timestamp}.py`;

            // Check if code uses matplotlib for graphs
            const hasMatplotlib = code.includes('matplotlib') ||
                code.includes('plt.show()') ||
                code.includes('plt.plot');

            // If matplotlib detected, wrap code to save graph
            let modifiedCode = code;
            if (hasMatplotlib) {
                modifiedCode = `
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
${code.replace('plt.show()', `
# Save graph instead of showing
import os
graph_path = 'graph_${timestamp}.png'
plt.savefig(graph_path, bbox_inches='tight', dpi=150)
plt.close()
print(f"GRAPH_SAVED:{os.path.abspath(graph_path)}")
`)}
`;
            }

            fs.writeFileSync(filename, modifiedCode);
            command = `python -X utf8 ${filename}`;

        } else if (lang === 'javascript' || lang === 'js') {
            filename = `temp_${timestamp}.js`;
            fs.writeFileSync(filename, code);
            command = `node ${filename}`;

        } else {
            return res.status(400).json({
                message: "Invalid language. Use 'Python' or 'JavaScript'"
            });
        }

        const start = Date.now();
        let stdout = '', stderr = '', graphPath = null;

        try {
            const result = await execPromise(command, {
                timeout: 30000, // 30 second timeout
                maxBuffer: 1024 * 1024 * 10 // 10MB buffer
            });
            stdout = result.stdout;
            stderr = result.stderr;

            // Check if graph was generated
            const graphMatch = stdout.match(/GRAPH_SAVED:(.+)/);
            if (graphMatch) {
                graphPath = graphMatch[1].trim();
                // Remove graph path from output
                stdout = stdout.replace(/GRAPH_SAVED:.+\n?/, '').trim();
            }

        } catch (error) {
            stderr = error.stderr || error.message;

            // Handle timeout
            if (error.killed) {
                stderr = 'Execution timeout: Code took too long to execute (30s limit)';
            }
        }

        const end = Date.now();
        const executionTime = end - start;

        // Read graph if it exists
        let graphBase64 = null;
        if (graphPath && fs.existsSync(graphPath)) {
            try {
                const graphBuffer = fs.readFileSync(graphPath);
                graphBase64 = `data:image/png;base64,${graphBuffer.toString('base64')}`;

                // Clean up graph file
                fs.unlinkSync(graphPath);
            } catch (graphError) {
                console.error('Error reading graph:', graphError);
            }
        }

        // Clean up code file
        if (fs.existsSync(filename)) {
            fs.unlinkSync(filename);
        }

        return res.status(200).json({
            output: stdout,
            executionTime: `${executionTime} ms`,
            error: stderr,
            graph: graphBase64, // Will be null if no graph
            hasGraph: !!graphBase64
        });

    } catch (err) {
        console.error('Error in runcode:', err);
        return res.status(500).json({
            message: 'Internal server error',
            error: err.message
        });
    }
};

/**
 * Save code submission to database
 */
export const saveCode = async (req, res) => {
    try {
        const { code, language, output, fileName, error, executionTime, graph } = req.body;
        const user = req.user?.id;

        if (!code || !language) {
            return res.status(400).json({
                message: "Code and language are required"
            });
        }

        const newCode = await codeService.savecode({
            code,
            language,
            fileName: fileName || 'Untitled',
            user,
            output: output || '',
            error: error || '',
            executionTime: executionTime || '0 ms',
            graph: graph || null // Save graph if present
        });

        res.status(201).json({
            message: 'Code saved successfully',
            data: newCode
        });

    } catch (err) {
        console.error('Error in saveCode:', err);
        res.status(500).json({
            message: 'Failed to save code',
            error: err.message
        });
    }
};

/**
 * Get all submissions for logged-in user
 */
export const getSubmissions = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                message: "User not authenticated"
            });
        }

        const codes = await codeService.getAllSubmissions(userId);

        res.status(200).json({
            message: 'Submissions retrieved successfully',
            count: codes.length,
            data: codes
        });

    } catch (err) {
        console.error('Error in getSubmissions:', err);
        res.status(500).json({
            message: 'Failed to retrieve submissions',
            error: err.message
        });
    }
};

/**
 * Get single submission by ID
 */
export const getSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Submission ID is required"
            });
        }

        const code = await codeService.getSubmissionById(id);

        if (!code) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        // Check if user owns this submission
        if (req.user?.id && code.user?.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        res.status(200).json({
            message: 'Submission retrieved successfully',
            data: code
        });

    } catch (err) {
        console.error('Error in getSubmissionById:', err);
        res.status(500).json({
            message: 'Failed to retrieve submission',
            error: err.message
        });
    }
};

/**
 * Delete submission by ID
 */
export const deleteSubmissionById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Submission ID is required"
            });
        }

        const code = await codeModel.findById(id);

        if (!code) {
            return res.status(404).json({
                message: "Submission not found"
            });
        }

        // Check if user owns this submission
        if (req.user?.id && code.user?.toString() !== req.user.id) {
            return res.status(403).json({
                message: "Access denied"
            });
        }

        await codeModel.findByIdAndDelete(id);

        res.status(200).json({
            message: "Submission deleted successfully"
        });

    } catch (err) {
        console.error('Error in deleteSubmissionById:', err);
        res.status(500).json({
            message: 'Failed to delete submission',
            error: err.message
        });
    }
};

/**
 * Generate graph from data (optional separate endpoint)
 */
export const generateGraph = async (req, res) => {
    try {
        const { xData, yData, graphType = 'line', title = 'Graph', xlabel = 'X', ylabel = 'Y' } = req.body;

        if (!xData || !yData) {
            return res.status(400).json({
                message: "xData and yData are required"
            });
        }

        const timestamp = Date.now();
        const filename = `graph_gen_${timestamp}.py`;
        const graphPath = `graph_output_${timestamp}.png`;

        // Generate Python code for graph
        const pythonCode = `
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import json

x_data = ${JSON.stringify(xData)}
y_data = ${JSON.stringify(yData)}

plt.figure(figsize=(10, 6))

graph_type = '${graphType}'
if graph_type == 'line':
    plt.plot(x_data, y_data, marker='o', linewidth=2)
elif graph_type == 'bar':
    plt.bar(x_data, y_data, color='skyblue')
elif graph_type == 'scatter':
    plt.scatter(x_data, y_data, s=100, alpha=0.6)
else:
    plt.plot(x_data, y_data)

plt.title('${title}', fontsize=16)
plt.xlabel('${xlabel}')
plt.ylabel('${ylabel}')
plt.grid(True, alpha=0.3)
plt.savefig('${graphPath}', bbox_inches='tight', dpi=150)
plt.close()
print('Graph generated successfully')
`;

        fs.writeFileSync(filename, pythonCode);

        const command = `python -X utf8 ${filename}`;
        await execPromise(command, { timeout: 10000 });

        // Read and encode graph
        const graphBuffer = fs.readFileSync(graphPath);
        const graphBase64 = `data:image/png;base64,${graphBuffer.toString('base64')}`;

        // Cleanup
        fs.unlinkSync(filename);
        fs.unlinkSync(graphPath);

        res.status(200).json({
            message: 'Graph generated successfully',
            graph: graphBase64
        });

    } catch (err) {
        console.error('Error in generateGraph:', err);
        res.status(500).json({
            message: 'Failed to generate graph',
            error: err.message
        });
    }
};