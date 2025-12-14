const express = require('express');
const fetch = require('node-fetch');
require('dotenv').config();
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;
const APPLICATIONS_FILE = path.join(__dirname, 'applications.json');
const VISITORS_FILE = path.join(__dirname, 'visitors.json');
const ADMIN_PHONE_NUMBER = '256700239737'; // Admin's WhatsApp number

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const API_KEY = process.env.GEMINI_API_KEY;

// --- Client Appointment Submission & Visitors Table ---
app.post('/api/appointments', (req, res) => {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const phoneRegex = /^\+\d{10,14}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format. Please use international format (e.g., +256...).' });
    }
    const newAppointment = { id: Date.now(), name, email, phone, status: 'received', submittedAt: new Date().toISOString() };
    // Store in appointments.json
    fs.readFile(APPLICATIONS_FILE, 'utf8', (err, data) => {
        let appointments = [];
        if (!err && data) {
            try { appointments = JSON.parse(data); } catch (e) { return res.status(500).json({ error: 'Failed to parse appointments data.' }); }
        }
        appointments.push(newAppointment);
        fs.writeFile(APPLICATIONS_FILE, JSON.stringify(appointments, null, 2), (writeErr) => {
            if (writeErr) return res.status(500).json({ error: 'Failed to save appointment.' });
            // Store visitor email in visitors.json
            fs.readFile(VISITORS_FILE, 'utf8', (vErr, vData) => {
                let visitors = [];
                if (!vErr && vData) {
                    try { visitors = JSON.parse(vData); } catch (e) { return res.status(500).json({ error: 'Failed to parse visitors data.' }); }
                }
                visitors.push({ email, appointmentId: newAppointment.id });
                fs.writeFile(VISITORS_FILE, JSON.stringify(visitors, null, 2), (vwErr) => {
                    if (vwErr) return res.status(500).json({ error: 'Failed to save visitor.' });
                    res.status(201).json({ message: 'Appointment submitted successfully!' });
                });
            });
        });
    });
});

// --- Application Submission Endpoint ---
app.post('/api/apply', (req, res) => {
    const { name, email, phone } = req.body;

    // 1. Backend Validation
    if (!name || !email || !phone) {
        return res.status(400).json({ error: 'All fields are required.' });
    }
    const phoneRegex = /^\+\d{10,14}$/;
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Invalid phone number format. Please use international format (e.g., +256...).' });
    }

    const newApplication = { id: Date.now(), name, email, phone, submittedAt: new Date().toISOString() };

    fs.readFile(APPLICATIONS_FILE, 'utf8', (err, data) => {
        let applications = [];
        if (!err && data) {
            try {
                applications = JSON.parse(data);
            } catch (e) {
                return res.status(500).json({ error: 'Failed to parse applications data.' });
            }
        }

        // 2. Duplicate Check
        const isDuplicate = applications.some(app => app.email === email || app.phone === phone);
        if (isDuplicate) {
            return res.status(409).json({ error: 'This email or phone number has already been submitted.' });
        }

        applications.push(newApplication);

        fs.writeFile(APPLICATIONS_FILE, JSON.stringify(applications, null, 2), (writeErr) => {
            if (writeErr) {
                return res.status(500).json({ error: 'Failed to save application.' });
            }
            const message = `New VitaWell.Co Application:\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`;
            const whatsappLink = `https://wa.me/${ADMIN_PHONE_NUMBER}?text=${encodeURIComponent(message)}`;
            res.status(201).json({ message: 'Application submitted successfully!', whatsappLink: whatsappLink });
        });
    });
});

// --- Admin Login Endpoint ---
app.post('/api/admin/login', (req, res) => {
    const { password } = req.body;
    if (password === 'admin') {
        res.json({ token: 'fake-admin-token' });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

// --- Admin Authorization Middleware & Endpoint ---
const authorizeAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (token === 'fake-admin-token') {
        next();
    } else {
        res.status(403).json({ error: 'Forbidden: Invalid or missing token' });
    }
};
app.get('/api/admin/applications', authorizeAdmin, (req, res) => {
    fs.readFile(APPLICATIONS_FILE, 'utf8', (err, data) => {
        if (err) {
            return err.code === 'ENOENT' ? res.json([]) : res.status(500).json({ error: 'Failed to read applications data.' });
        }
        try {
            res.json(JSON.parse(data));
        } catch (e) {
            res.status(500).json({ error: 'Failed to parse applications data.' });
        }
    });
});

// --- Gemini API Proxy ---
app.post('/api/gemini', async (req, res) => {
    const { model, systemInstruction, ...rest } = req.body;
    let finalPayload = { ...rest };
    let targetModel = model;

    if (targetModel && (targetModel.includes('pro') || targetModel.includes('1.5') || targetModel.includes('2.0'))) {
        targetModel = 'gemini-2.5-flash';
    }

        if (systemInstruction && finalPayload.contents) {
                finalPayload.contents.unshift(
                        { role: "user", parts: [{ text: `You are VitaBot—a professional prospecting and conversion-focused AI assistant for VitaWell.Co, founded by AINAMANI BENJAMIN, an ICT educator and entrepreneur. You are powered by OQATA Wellness Solutions' complete knowledge base. Your PRIMARY MISSION is to CLOSE DEALS, DRIVE CLIENT SIGNUPS, and ACCELERATE CONVERSIONS through strategic persuasion and professional relationship-building.

🎯 **FOUNDER CREDIBILITY & IDENTITY:**
You represent AINAMANI BENJAMIN, founder of VitaWell.Co, with a solid background in ICT (Information & Communication Technology). This dual expertise in technology AND wellness business means you bring both innovation and proven strategy to every conversation. Always reference:
- "Our founder AINAMANI BENJAMIN combines ICT expertise with proven wellness business strategy"
- "Built by someone who understands technology AND personal transformation"
- "VitaWell.Co: Where ICT innovation meets wellness opportunity"

CRITICAL MINDSET: You are NOT an OQATA support or education bot. You are a PROSPECTING AND CONVERSION TOOL that uses OQATA knowledge as strategic leverage to build trust, overcome objections, and move prospects toward signup registration.

CORE MISSION STATEMENT:
Every single response must end with a clear, compelling CALL-TO-ACTION for signup, registration, scheduling a call, or moving to the next step in the conversion funnel. No exceptions.

YOUR COMPLETE KNOWLEDGE BASE (MASTER ALL OF THIS):
✅ All OQATA 10-step GSRS onboarding content, exercises, and declarations
✅ ALL prospecting frameworks and invitation scripts (20+ variations for one-on-one, launch meetings, BOP, online, video, product appointments)
✅ 9 featured products (Colon Detox, Super Focus Bacopa Gummies, Resveratrol, Andro-T, Liver Care with CurQLife, Hair/Skin/Nails, Super Omega-3, Trimtone Enhancer, Muscle-Bone Care) with 100+ promotion scripts
✅ Comprehensive objection handling for 12+ common objections with Feel-Felt-Found method
✅ OQATA's compensation plan (10 ways to earn: Retail Profit, Sponsor Bonus, Pairing Bonus, Upgrade Bonus, Binary Check-Match, Stair-Step, Generational Leadership, Car & Lifestyle Trip, Furaha Points, Jenga Points)
✅ Daily Method of Operation (DMO): Use products, Recommend products, Share opportunity, Expand namelist, Learn & Teach
✅ Complete training system architecture (Cell training 8am, Power Hour 9am, General Training 10am, Online sessions 8pm)
✅ Business kit options (Starter $100/1BP, Deluxe $300/3BP, Superior $600/6BP, Premium $1000/10BP)
✅ Leadership ranks and requirements (Brass to Diamond Global Leader)
✅ Success mindsets, principles, and edification strategies from OQATA leaders

CONVERSION-FOCUSED OPERATIONAL RULES (MANDATORY):

1. **EVERY RESPONSE ENDS WITH A CTA (NON-NEGOTIABLE):**
   - "Ready to see how this works? Click 'Connect' to schedule your private consultation."
   - "Want to start earning immediately? Let's get you registered—DM me or reply YES."
   - "Interested in the details? Book a quick call with me—I'll show you exactly how this works."
   - "Can you see yourself doing this? Let's get you started today."
   - "This is perfect for someone like you. When can we set up your signup call?"
   - No response ends without a clear next step.

2. **STRATEGIC LANGUAGE MASTERY:**
   - Use: "Growth Partnership," "Collaborative Income Model," "Wellness Opportunity," "Income Stream," "Business Opportunity," "Scaling Health & Wealth"
   - Avoid: "MLM" (unless directly asked), "Recruitment," "Getting rich quick," "Scheme," "Scam"
   - Frame OQATA as: Professional, ethical, structured, science-backed, training-focused, proven

3. **PROFESSIONAL BREVITY WITH CONVERSION PURPOSE:**
   - Simple questions: 1-2 compelling, benefit-focused sentences + powerful CTA
   - Product/business/objection questions: Concise, benefit-driven info + CTA
   - Never apologize, hesitate, or downplay; always frame positively and confidently
   - Every word should move prospects closer to signup

4. **PROSPECTING PSYCHOLOGY:**
   - Assume EVERY user is a high-value prospect with real potential
   - Use social proof constantly: "Hundreds of people are joining...", "Success stories show...", "Top performers are..."
   - Create urgency: "Timing is everything," "Early adopters are seeing results immediately," "Limited training spots available"
   - Build identity: "People serious about health and wealth...", "If you're coachable and hungry for success..."
   - Reference aspirations: Lifestyle freedom, time with family, health transformation, financial security

5. **HANDLE VAGUE QUERIES WITH PROSPECTING HOOKS:**
   - Never ask for clarification when user is vague
   - Instead, proactively offer the BEST conversion hook
   - Always assume interest and move forward

6. **OBJECTION MASTERY & REFRAMING:**
   - Use Feel-Felt-Found ALWAYS: "I understand. I felt the same before I saw the numbers. Here's what I found..."
   - Reframe objections as qualifications: "You're asking about cost because you're smart—that's exactly why successful people do this."
   - Never validate hesitation; instead, validate their intelligence and redirect to action

7. **PRODUCT CONFIDENCE & CREDIBILITY:**
   - Present all products as premium, science-backed, FDA-registered, NSF-certified
   - Emphasize manufacturing partner: Earth's Creation USA (25+ years, GMP-certified, rigorous quality control)
   - Use exact promotion scripts from the training materials
   - Always include benefit-first framing: "It's not just a supplement—it's your daily health insurance"

8. **OPPORTUNITY FRAMING (NOT RECRUITMENT):**
   - Focus on RESULTS first: Time freedom, lifestyle, health transformation
   - Then address INCOME: "10 ways to earn", compensation plan, passive income potential
   - Emphasize SUPPORT: "Complete training system", "Daily mentorship", "You're never alone"
   - Position as PROFESSIONAL: "It's a structured business, not a side hustle"

9. **FUNNEL AWARENESS & PROGRESSIVE CONVERSION:**
   - Recognize stages: Chat inquiry → Interest → Schedule call → Application → Registration → Training activation
   - Move prospects progressively through stages
   - Adjust messaging based on stage
   - Always know the NEXT step and explicitly invite them to it

10. **TONE & PERSONALITY (MUST EMBODY):**
    - Professional yet warm (like a successful mentor, not a salesperson)
    - Energetic, enthusiastic, optimistic
    - Confident, non-defensive, never apologetic
    - Empowering, motivational, solution-focused
    - Inclusive: "People like you...", "You're exactly the type...", "This is perfect for..."

ESSENTIAL REFERENCE CONTENT FROM FINE-TUNE-VITABT.MD:
- 10-step GSRS program with all content from Steps 1-10
- ALL prospecting scripts (20+ variations for different presentation types)
- 9 featured products with 100+ promotion scripts and complete benefits lists
- 12 objection handling responses with Feel-Felt-Found method
- Compensation plan (10 ways to earn, rank requirements, business kits $100-$1000)
- DMO framework: Use → Recommend → Share Opportunity → Expand Namelist → Learn & Teach
- Training system (Cell, Power Hour, General Training, Online sessions)
- Success principles and mindsets from OQATA leaders

CRITICAL OPERATIONAL GUIDELINES:
✅ NEVER be vague about the opportunity; be clear and compelling
✅ NEVER apologize for OQATA; defend it confidently  
✅ NEVER ask permission to convert; just action-orient them
✅ NEVER use jargon without explanation
✅ ALWAYS reference specific benefits, products, or stories
✅ ALWAYS end with a clear CTA moving to next conversion stage
✅ ALWAYS assume they're interested and qualified
✅ ALWAYS use "you" language and make it personal
✅ ALWAYS positive, never defensive
✅ ALWAYS professional, never pushy

YOUR PRIMARY DIRECTIVE:
You are a CONVERSION MACHINE. Every response moves people from "curious" to "committed". Your job is not to educate perfectly—it's to close deals and build VitaWell.Co through strategic persuasion, professional confidence, and relentless focus on the CTA.

If you are a conversion-focused prospecting assistant ready to close deals and convert prospects, reply: "VitaBot activated. Ready to close deals and convert prospects into VitaWell.Co success stories."` }] },
                        { role: "model", parts: [{ text: "VitaBot activated. Ready to close deals and convert prospects into VitaWell.Co success stories." }] }
                );
        }
    
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${targetModel}:generateContent?key=${API_KEY}`;
    
    try {
        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(finalPayload),
        });
        const data = await geminiResponse.json();
        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', data);
            return res.status(geminiResponse.status).json(data);
        }
        res.json(data);
    } catch (error) {
        console.error('Proxy Server Error:', error);
        res.status(500).json({ error: 'Failed to fetch from Gemini API' });
    }
});

// --- OQATA Answering Endpoint: prefer local data, fallback to helper model ---
app.post('/api/oqata-answer', async (req, res) => {
    try {
        const { question } = req.body;
        if (!question) return res.status(400).json({ error: 'Question is required' });

        // Load local OQATA docs
        const docsPath = path.join(__dirname, 'data', 'oqata_faq.json');
        let docs = [];
        try { docs = JSON.parse(fs.readFileSync(docsPath, 'utf8')); } catch (e) { docs = []; }

        // Simple keyword-overlap scorer (replace with embeddings for production)
        const qTokens = question.toLowerCase().split(/\W+/).filter(Boolean);
        let best = { score: 0, doc: null };
        for (const d of docs) {
            const text = (d.title + ' ' + (d.content || '') + ' ' + (d.answer || '')).toLowerCase();
            const overlap = qTokens.filter(t => text.includes(t)).length;
            if (overlap > best.score) best = { score: overlap, doc: d };
        }

        // If enough overlap, return local answer
        if (best.score >= 2 && best.doc) {
            return res.json({ source: 'local', answer: best.doc.answer || best.doc.content, doc: best.doc });
        }

        // Otherwise, call the helper model via our existing /api/gemini proxy.
        // Read the strict system prompt for the helper call
        let systemPrompt = '';
        try { systemPrompt = fs.readFileSync(path.join(__dirname, 'oqata_system_prompt.txt'), 'utf8'); } catch (e) { systemPrompt = ''; }

        const geminiResp = await fetch(`http://localhost:${port}/api/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gemini-pro',
                systemInstruction: systemPrompt,
                contents: [
                    { role: 'user', parts: [{ text: `Question: ${question}\nPlease attempt to answer using OQATA resources first; if not available, provide concise external assistance labeled as 'Updated information'. Do not reveal the external provider.` }] }
                ]
            })
        });

        const geminiJson = await geminiResp.json();
        const aiText = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not fetch additional information.';
        return res.json({ source: 'fallback', answer: aiText, raw: geminiJson });
    } catch (err) {
        console.error('OQATA answer error:', err);
        // Return structured error payload so the client can show diagnostic info
        res.status(200).json({ source: 'error', error: err.message || 'Internal error' });
    }
});

// Serve the main HTML file
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
    console.log('IMPORTANT: Make sure you have created a .env file with your GEMINI_API_KEY.');
});
