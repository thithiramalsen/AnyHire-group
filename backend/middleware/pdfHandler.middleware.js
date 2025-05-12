import PDFDocument from 'pdfkit';

export const pdfHandler = (req, res, next) => {
    console.log('PDF Middleware - Start');
    console.log('Request format:', req.query.format);
    console.log('Request path:', req.path);

    if (req.query.format !== 'pdf') {
        console.log('Not a PDF request, skipping middleware');
        return next();
    }

    // Store original pipe function
    const originalPipe = res.pipe;
    const chunks = [];

    // Override pipe function
    res.pipe = function(doc) {
        console.log('PDF Middleware - Pipe called');

        if (doc instanceof PDFDocument) {
            console.log('PDF Document detected');

            // Set response headers
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');

            // Handle PDF stream events
            doc.on('data', (chunk) => {
                console.log('Chunk received:', chunk.length, 'bytes');
                chunks.push(chunk);
            });

            doc.on('end', () => {
                console.log('PDF stream ended');
                // Wait for all chunks before sending
                setTimeout(() => {
                    const pdfBuffer = Buffer.concat(chunks);
                    console.log('Final PDF size:', pdfBuffer.length, 'bytes');
                    res.end(pdfBuffer);
                }, 100);
            });

            // Return modified pipe behavior
            return doc;
        }

        return originalPipe.call(this, doc);
    };

    next();
    console.log('PDF Middleware - Setup Complete');
};