# Aplicativo Web Semillero IoTic

Esta es una plataforma web desarrollada para el Semillero IoTic por el grupo **Nebula**.  

Su objetivo es centralizar la gestión de **usuarios, roles, inventario, noticias, eventos y cursos** relacionados con las actividades del semillero.

---

## Cómo correr el backend por primera vez

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Zombisa/Aplicacion-Web-IoTic
   cd Backend
   ```

2. **Crear un entorno virtual**
   ```bash
   python -m venv venv
   ```
   - Activar el entorno:
     - **Windows (PowerShell):**
       ```bash
       venv\Scripts\activate
       ```
     - **Linux/Mac:**
       ```bash
       source venv/bin/activate
       ```

3. **Instalar dependencias**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configurar variables de entorno**
   Crear un archivo `.env` en `backend/` con al menos:
   ```env
   SECRET_KEY=supersecreta
   DEBUG=True
   ALLOWED_HOSTS=127.0.0.1,localhost
   ```

5. **Aplicar migraciones iniciales**
   ```bash
   python manage.py migrate
   ```

6. **Crear un superusuario (opcional, para admin)**
   ```bash
   python manage.py createsuperuser
   ```

7. **Levantar el servidor**
   ```bash
   python manage.py runserver
   ```
   - Backend en: http://127.0.0.1:8000  
   - Panel de administración: http://127.0.0.1:8000/admin

---

## Flujo de trabajo a partir de ese punto

Cada vez que descargues cambios del repositorio:

1. **Actualizar repo**
   ```bash
   git pull
   ```

2. **Actualizar dependencias (si hay cambios en requirements.txt)**
   ```bash
   pip install -r requirements.txt
   ```

3. **Aplicar migraciones nuevas**
   ```bash
   python manage.py migrate
   ```

4. **Levantar servidor**
   ```bash
   python manage.py runserver
   ```
