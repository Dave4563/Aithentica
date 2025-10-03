# Aithentica

A full-stack AI assistant application inspired by ChatGPT. It provides both **chat** and **vision (image generation)** features, supports multiple AI providers (OpenAI, Anthropic, Gemini, Groq, DeepSeek, Pollinations), and includes **per-user chat history and token tracking**.  

The backend is built with **Django** and **exposes RESTful API endpoints** via Django Rest Framework (DRF), with **JWT authentication** and secure refresh tokens stored as **HttpOnly cookies**. The backend is deployed on an **AWS EC2 instance**, providing full control over server configuration, SSL, and database management.  

The frontend is built with **React** for a modern, responsive, and seamless user experience, styled with **Tailwind CSS**, and is deployed on **Vercel** for fast CDN delivery, automatic HTTPS, and global distribution. This separation allows the backend to handle API and data securely while the frontend benefits from a scalable, fast, and easy-to-deploy hosting solution.


------------------------------------------------------------------------

## 📂 Project Structure

    .
    ├── backend/      # Django + DRF backend with JWT auth and AI endpoints
    ├── frontend/     # React + Vite frontend (TypeScript)
    └── README.md     # This file

------------------------------------------------------------------------

## Demo

![User Interface](frontend/src/assets/ui.gif)

------------------------------------------------------------------------


## ⚙️ Backend (Django + DRF)

### Features
-  **Django REST Framework** for building RESTful API endpoints.  
-  **JWT Authentication** with [`djangorestframework-simplejwt`](https://django-rest-framework-simplejwt.readthedocs.io/en/latest/).  
-  **Secure refresh tokens** stored as **HttpOnly cookies**.  
-  **AI chat endpoints** integrating multiple LLM providers: OpenAI, Anthropic, Gemini, Groq, DeepSeek, and Pollinations.  
-  **Vision support** (image generation via Pollinations API).  
-  **Chat history & token usage tracking** per user (stores the last 5 messages and token consumption).  


---

### Setup Locally

1. **Prerequisites**
   - Install **Python** (e.g., Python 3.12).
   - Install **[uv](https://github.com/astral-sh/uv)** (Python package/dependency manager).

2. **Navigate to the backend folder:**
   ```bash
   cd backend
   ```
3. **Configure environment variables:**

   Rename .env.example to .env and fill in your keys.
   ```env
    DJANGO_SECRET_KEY=
    # Optional
    OPENAI_API_KEY=
    # Optional
    GOOGLE_API_KEY=
    # Optional
    ANTHROPIC_API_KEY=
    # Optional
    GROQ_API_KEY=
    # Optional
    DEEPSEEK_API_KEY=
   ```
4.  install dependencies:

    ```bash
    uv sync
    ```

5. Run database migrations:

    ```bash
    uv run python manage.py migrate
    ```

6. Start the development server:

    ```bash
    uv run python manage.py runserver
    ```

Backend will run at: `http://localhost:8000`

---

### Backend Deployment on AWS EC2

1. **Launch an EC2 Instance**  
   - Create an AWS account and launch an **Ubuntu** EC2 instance (recommended: Ubuntu).  
   - Assign at least **20 GB storage**.  
   - Ensure the **security group** allows inbound traffic on ports `22 (SSH)`, `80 (HTTP)`, and `443 (HTTPS)`.

2. **Connect to the Instance**
   ```bash
   ssh -i <your-key.pem> ubuntu@<EC2_PUBLIC_IP>
   ```
   Replace <your-key.pem> with your SSH key and <EC2_PUBLIC_IP> with the instance’s public IP.

3. **Install Docker & Docker Compose**
    ```bash
    sudo apt update && sudo apt upgrade -y
    curl -o get-docker.sh https://get.docker.com/
    sudo bash get-docker.sh
    ```
4. Clone the Project Repository
    ```bash
    git clone https://github.com/vasiliskou/Aithentica.git
    cd Aithentica/backend
    ```
5. Configure Environment Variables
    * Copy .env.example → .env:
    ```bash
    cp .env.example .env
    ```
    * Open .env and adjust values:
        * Set database configuration (disable SQLite):
    ```ini
    USE_SQLITE=False
    ```
    * Add your domain and optional LLM API keys.

6. Obtain SSL Certificates with Certbot
    * Edit backend/nginx/conf.d/default.conf:
        * Complete missing domains
        * Temporarily comment out the HTTPS server block so Nginx only listens on port 80.
    * Run certbot to generate certificates:
    ```bash
    sudo docker compose run --rm certbot certonly --webroot --webroot-path=/var/www/certbot --email <your_email> --agree-tos --no-eff-email -d <your_domain.com>
    ```
7. Enable HTTPS and Deploy
    * Uncomment the HTTPS block in nginx.conf so Nginx uses the generated certificates.
    * Build and start the stack:
    ```
    sudo docker compose up --build -d
    ```
    * Your backend should now be live at https://<your_domain.com>.

------------------------------------------------------------------------

## 💻 Frontend (React + Vite + TypeScript + Tailwind CSS)

### Features

- Home, Login, Register, and Dashboard pages.
- Token refresh on page load (using refresh cookie).
- Automatic retry of requests when the access token expires.
- Chat & Vision UIs with dropdowns for **Provider** and **Model** selection.


### Setup Locally

0. **Prerequisites:**

    Node.js installed

1.  Navigate to frontend folder:

    ``` bash
    cd frontend
    ```

2.  Install dependencies:

    ``` bash
    npm install
    ```

4.  Start frontend:

    ``` bash
    npm run dev
    ```

Frontend runs on: `http://localhost:5173`

---

### Frontend Deployment on Vercel

1. **Create a Vercel Account**
   - Go to [https://vercel.com](https://vercel.com) and sign up (GitHub, GitLab, or Bitbucket can be used).
   - Free plan includes automatic HTTPS and a global CDN.

2. **Import the Project into Vercel**
   - In the Vercel dashboard, click **"New Project"**.
   - Select **Import Git Repository**.
   - Paste the repo URL:  
     ```
     https://github.com/vasiliskou/Aithentica
     ```
   - Choose the **frontend** folder as the root.

3. **Configure Build Settings**
   - Framework Preset: **Vite**
   - Build Command:
     ```
     npm run build
     ```
   - Output Directory:
     ```
     dist
     ```
   - These are usually auto-detected, but verify before deploying.

4. **Set Environment Variables**
   - Since your frontend communicates with the backend (EC2 + Nginx + Django), set the API URL:
     - In Vercel → Project → Settings → **Environment Variables**:
       ```
       VITE_API_URL=https://<your-domain.com>
       ```
   - Save changes.

5. **Deploy**
   - Click **Deploy** in Vercel.
   - After deployment, your app will be available at:
     ```
     https://<project-name>.vercel.app
     ```

6. **Optional**
   - If you own a custom domain, you can connect it under **Domains** in project settings.



------------------------------------------------------------------------

## 🔐 Authentication Flow

-   On **login**, backend sets a `refreshToken` in an **HttpOnly Secure
    cookie**.\
-   Frontend stores the `accessToken` in `localStorage` and uses it for
    API requests.\
-   When the `accessToken` expires, frontend automatically calls
    `/auth/token/refresh/` using the refresh cookie.\
-   If refresh fails, user is logged out and redirected to `/login`.

------------------------------------------------------------------------

## 📜 License

MIT License.

