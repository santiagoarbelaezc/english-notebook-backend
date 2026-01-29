<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>English Notebook - Backend API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }

        .header {
            text-align: center;
            color: white;
            padding: 40px 20px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 20px;
            margin-bottom: 30px;
        }

        .header h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }

        .header h3 {
            font-size: 1.5em;
            font-weight: 300;
            margin-bottom: 20px;
        }

        .header p {
            font-size: 1.1em;
            max-width: 800px;
            margin: 0 auto;
        }

        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card h2 {
            color: #667eea;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 3px solid #667eea;
            display: inline-block;
        }

        .structure {
            background: #f8f9fa;
            border-left: 5px solid #667eea;
            padding: 20px;
            margin: 20px 0;
            font-family: 'Courier New', monospace;
            border-radius: 5px;
        }

        .file {
            color: #2c3e50;
            margin: 5px 0;
            padding-left: 20px;
            position: relative;
        }

        .file::before {
            content: '📄';
            position: absolute;
            left: 0;
        }

        .folder {
            color: #3498db;
            margin: 10px 0 5px 0;
            font-weight: bold;
            padding-left: 20px;
            position: relative;
        }

        .folder::before {
            content: '📁';
            position: absolute;
            left: 0;
        }

        .badge-container {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 20px 0;
        }

        .badge {
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 5px;
        }

        .express { background: #000; color: white; }
        .node { background: #339933; color: white; }
        .mongodb { background: #47A248; color: white; }
        .jwt { background: #000; color: white; }
        .cloudinary { background: #3448C5; color: white; }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .table th {
            background: #667eea;
            color: white;
            padding: 12px;
            text-align: left;
        }

        .table td {
            padding: 12px;
            border-bottom: 1px solid #ddd;
        }

        .table tr:hover {
            background: #f5f5f5;
        }

        .endpoint {
            background: #2c3e50;
            color: #ecf0f1;
            padding: 8px 12px;
            border-radius: 5px;
            font-family: 'Courier New', monospace;
            margin: 5px 0;
            display: inline-block;
        }

        .method-get { color: #61affe; }
        .method-post { color: #49cc90; }
        .method-put { color: #fca130; }
        .method-delete { color: #f93e3e; }

        .developer-card {
            text-align: center;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px;
            border-radius: 15px;
        }

        .social-links {
            display: flex;
            justify-content: center;
            gap: 20px;
            margin-top: 20px;
        }

        .social-link {
            padding: 10px 20px;
            background: white;
            color: #667eea;
            border-radius: 25px;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.3s ease;
        }

        .social-link:hover {
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2em;
            }
            
            .card {
                padding: 20px;
            }
            
            .badge-container {
                justify-content: center;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📚 English Notebook - Backend API</h1>
            <h3>🎯 Comprehensive English Learning Platform Backend</h3>
            <p>RESTful API built with Express.js for a complete English learning ecosystem featuring multimedia content, AI-powered conversations, gamification, and user progress tracking.</p>
        </div>

        <div class="card">
            <h2>🏗️ Project Structure</h2>
            <div class="structure">
                <div class="folder">english-notebook-backend/</div>
                
                <div class="folder">config/</div>
                <div class="file">database.js</div>
                <div class="file">cloudinary.js</div>
                <div class="file">constants.js</div>
                
                <div class="folder">controllers/</div>
                <div class="file">auth.controller.js</div>
                <div class="file">user.controller.js</div>
                <div class="file">conversation.controller.js</div>
                <div class="file">flashcard.controller.js</div>
                <div class="file">grammar.controller.js</div>
                <div class="file">multimedia.controller.js</div>
                <div class="file">achievement.controller.js</div>
                
                <div class="folder">logs/</div>
                <div class="file">access.log</div>
                <div class="file">error.log</div>
                <div class="file">combined.log</div>
                
                <div class="folder">middleware/</div>
                <div class="file">auth.middleware.js</div>
                <div class="file">validation.middleware.js</div>
                <div class="file">error.middleware.js</div>
                <div class="file">upload.middleware.js</div>
                <div class="file">rateLimit.middleware.js</div>
                
                <div class="folder">models/</div>
                <div class="file">User.js</div>
                <div class="file">Profile.js</div>
                <div class="file">Achievement.js</div>
                <div class="file">Conversation.js</div>
                <div class="file">Message.js</div>
                <div class="file">Flashcard.js</div>
                <div class="file">Grammar.js</div>
                <div class="file">Vocabulary.js</div>
                <div class="file">Song.js</div>
                <div class="file">Movie.js</div>
                <div class="file">Text.js</div>
                <div class="file">DailyPhrase.js</div>
                <div class="file">IrregularVerb.js</div>
                <div class="file">DailyCommitment.js</div>
                
                <div class="folder">routes/</div>
                <div class="file">auth.routes.js</div>
                <div class="file">user.routes.js</div>
                <div class="file">conversation.routes.js</div>
                <div class="file">learning.routes.js</div>
                <div class="file">multimedia.routes.js</div>
                <div class="file">admin.routes.js</div>
                
                <div class="folder">uploads/</div>
                <div class="folder">avatars/</div>
                <div class="folder">audio/</div>
                <div class="folder">documents/</div>
                <div class="folder">temp/</div>
                
                <div class="folder">utils/</div>
                <div class="file">errorHandler.js</div>
                <div class="file">responseHandler.js</div>
                <div class="file">fileProcessor.js</div>
                <div class="file">validator.js</div>
                <div class="file">logger.js</div>
                <div class="file">helpers.js</div>
                
                <div class="file">.env</div>
                <div class="file">.env.example</div>
                <div class="file">app.js</div>
                <div class="file">server.js</div>
                <div class="file">package.json</div>
            </div>
        </div>

        <div class="card">
            <h2>🔧 Technology Stack</h2>
            <div class="badge-container">
                <div class="badge express">Express.js</div>
                <div class="badge node">Node.js</div>
                <div class="badge mongodb">MongoDB</div>
                <div class="badge jwt">JWT Authentication</div>
                <div class="badge cloudinary">Cloudinary</div>
            </div>
        </div>

        <div class="card">
            <h2>📊 Database Models</h2>
            <table class="table">
                <thead>
                    <tr>
                        <th>Model</th>
                        <th>Description</th>
                        <th>Key Fields</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td><strong>User</strong></td>
                        <td>User authentication and core data</td>
                        <td>email, password, role, status</td>
                    </tr>
                    <tr>
                        <td><strong>Profile</strong></td>
                        <td>Extended user information</td>
                        <td>userId, level, streak, totalPoints</td>
                    </tr>
                    <tr>
                        <td><strong>Conversation</strong></td>
                        <td>AI dialogue sessions</td>
                        <td>userId, topic, difficulty, messages</td>
                    </tr>
                    <tr>
                        <td><strong>Flashcard</strong></td>
                        <td>Vocabulary cards</td>
                        <td>userId, front, back, category</td>
                    </tr>
                    <tr>
                        <td><strong>Song</strong></td>
                        <td>Music-based learning</td>
                        <td>title, artist, lyrics, vocabulary</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="card">
            <h2>🌐 API Endpoints</h2>
            <div>
                <div class="endpoint"><span class="method-post">POST</span> /api/auth/register</div>
                <div class="endpoint"><span class="method-post">POST</span> /api/auth/login</div>
                <div class="endpoint"><span class="method-get">GET</span> /api/users/profile</div>
                <div class="endpoint"><span class="method-put">PUT</span> /api/users/profile</div>
                <div class="endpoint"><span class="method-post">POST</span> /api/conversations</div>
                <div class="endpoint"><span class="method-get">GET</span> /api/flashcards</div>
                <div class="endpoint"><span class="method-get">GET</span> /api/songs</div>
                <div class="endpoint"><span class="method-get">GET</span> /api/daily-phrase</div>
            </div>
        </div>

        <div class="card">
            <h2>🚀 Quick Start</h2>
            <div class="structure">
                <div># Clone repository</div>
                <div>git clone https://github.com/your-repo.git</div>
                <div>cd english-notebook-backend</div>
                <br>
                <div># Install dependencies</div>
                <div>npm install</div>
                <br>
                <div># Configure environment</div>
                <div>cp .env.example .env</div>
                <br>
                <div># Start development server</div>
                <div>npm run dev</div>
            </div>
        </div>

        <div class="developer-card">
            <h2>👨‍💻 Developer</h2>
            <p><strong>Santiago Arbelaez Contreras</strong></p>
            <p>Junior Full Stack Developer</p>
            <p>Software Engineering Student – University of Quindío</p>
            
            <div class="social-links">
                <a href="https://github.com/santiagoarbelaezc" class="social-link">GitHub</a>
                <a href="https://www.linkedin.com/in/santiago-arbelaez-contreras-9830b5290/" class="social-link">LinkedIn</a>
                <a href="https://portfolio-santiagoa.web.app/portfolio" class="social-link">Portfolio</a>
            </div>
        </div>
    </div>

    <script>
        // Add subtle animations
        document.addEventListener('DOMContentLoaded', function() {
            const cards = document.querySelectorAll('.card');
            cards.forEach((card, index) => {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100 * index);
            });
        });
    </script>
</body>
</html>
