<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>LabVert – Système d’arrosage intelligent</title>
    <style>
        :root {
            --vert-fonce: #1b5e20;
            --vert: #43a047;
            --vert-clair: #e8f5e9;
            --accent: #8bc34a;
            --texte: #222;
            --gris: #666;
            --fond: #f5f5f5;
            --radius: 10px;
            --shadow: 0 4px 12px rgba(0,0,0,0.08);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
            background: radial-gradient(circle at top left, #e8f5e9 0, #f5f5f5 45%, #ffffff 100%);
            color: var(--texte);
            line-height: 1.6;
        }

        header {
            background: linear-gradient(135deg, var(--vert-fonce), var(--vert));
            color: white;
            padding: 2.5rem 10vw 3.5rem;
            border-radius: 0 0 40px 40px;
            box-shadow: var(--shadow);
            position: relative;
            overflow: hidden;
        }

        header::after {
            content: "";
            position: absolute;
            right: -80px;
            top: -80px;
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: rgba(255,255,255,0.08);
        }

        .badge {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            border-radius: 999px;
            padding: 0.25rem 0.9rem;
            font-size: 0.8rem;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }

        h1 {
            font-size: 2.6rem;
            margin-top: 0.8rem;
            margin-bottom: 0.4rem;
            letter-spacing: 0.03em;
        }

        .subtitle {
            font-size: 1.05rem;
            max-width: 600px;
            color: #e0f2f1;
        }

        .meta {
            margin-top: 1.5rem;
            font-size: 0.95rem;
            color: #c8e6c9;
        }

        .meta span {
            display: inline-block;
            margin-right: 1.5rem;
        }

        main {
            padding: 2.5rem 10vw 3rem;
        }

        section {
            margin-bottom: 2rem;
        }

        h2 {
            font-size: 1.5rem;
            margin-bottom: 0.8rem;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
        }

        h2::before {
            content: "";
            width: 6px;
            height: 22px;
            border-radius: 999px;
            background: linear-gradient(180deg, var(--vert), var(--accent));
        }

        h3 {
            font-size: 1.1rem;
            margin-bottom: 0.4rem;
            color: var(--vert-fonce);
        }

        p {
            margin-bottom: 0.4rem;
            color: var(--texte);
        }

        .grid-2 {
            display: grid;
            grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
            gap: 1.5rem;
            align-items: flex-start;
        }

        .card {
            background: white;
            border-radius: var(--radius);
            padding: 1.2rem 1.4rem;
            box-shadow: var(--shadow);
        }

        .card.soft {
            background: var(--vert-clair);
        }

        ul {
           
