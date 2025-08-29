export default function handler(req, res) {
  res.status(200).json({ 
    message: "Hello from Vercel Backend!",
    timestamp: new Date().toISOString(),
    method: req.method
  });
}
