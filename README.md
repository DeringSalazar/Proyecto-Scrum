# Plataforma de Gestión de Incidentes TI

## 1. Descripción general del proyecto

Este repositorio corresponde a una aplicación web de tipo Service Desk para la gestión operativa de incidentes de TI. Permite registrar incidentes, asignar responsables, actualizar estados, administrar usuarios y visualizar reportes y métricas desde una interfaz sencilla en español.

La solución está implementada como una aplicación frontend estática, sin backend independiente ni conexión a una base de datos relacional tradicional.

## 2. Estructura del repositorio

| Ruta | Propósito |
| --- | --- |
| [index.html](index.html) | Punto de entrada de la aplicación. Define la estructura principal de la interfaz, los contenedores de páginas y carga los archivos JavaScript y CSS. |
| [assets/](assets) | Contiene recursos estáticos del proyecto. En este caso, incluye el icono de la aplicación en [assets/icons/favicon.ico](assets/icons/favicon.ico). |
| [css/](css) | Archivos de estilos CSS que definen la apariencia de la plataforma. Incluye estilos globales y específicos por módulo: [css/styles.css](css/styles.css), [css/login.css](css/login.css), [css/dashboard.css](css/dashboard.css), [css/incidents.css](css/incidents.css), [css/kanban.css](css/kanban.css), [css/users.css](css/users.css), [css/reports.css](css/reports.css), [css/sidebar.css](css/sidebar.css), [css/topbar.css](css/topbar.css), [css/modal.css](css/modal.css) y [css/incident-detail.css](css/incident-detail.css). |
| [js/](js) | Contiene la lógica de negocio, la navegación, la autenticación, la persistencia de datos y las vistas del sistema. |
| [.vscode/](.vscode) | Configuración del entorno de desarrollo. En este proyecto incluye [\.vscode/settings.json](.vscode/settings.json) con la configuración del puerto de Live Server. |

### Archivos JavaScript principales

| Archivo | Función principal |
| --- | --- |
| [js/app.js](js/app.js) | Inicializa la app, valida si hay sesión activa y controla la navegación entre pantallas. |
| [js/BdD.js](js/BdD.js) | Es el módulo central de persistencia. Define la lógica para leer y guardar incidentes, usuarios, comentarios, acciones del dashboard y la sesión actual. |
| [js/login.js](js/login.js) | Maneja el login, el registro de usuarios y el cierre de sesión. |
| [js/password-recovery.js](js/password-recovery.js) | Implementa el flujo de recuperación de contraseña. |
| [js/incidents.js](js/incidents.js) | Renderiza la vista de incidentes, permite registrar tickets y filtrar/consultar su información. |
| [js/kanban.js](js/kanban.js) | Implementa el tablero Kanban y la actualización de estados por arrastre o botones. |
| [js/dashboard.js](js/dashboard.js) | Construye el dashboard operativo con métricas, pendientes y últimas acciones. |
| [js/users.js](js/users.js) | Administra la creación, edición, activación/desactivación y listado de usuarios. |
| [js/reports.js](js/reports.js) | Genera reportes, filtros y resumen de incidentes. |
| [js/sidebar.js](js/sidebar.js) | Renderiza el menú lateral según el rol del usuario. |
| [js/topbar.js](js/topbar.js) | Renderiza la barra superior con la identidad del usuario activo. |
| [js/modal.js](js/modal.js) | Maneja modales y mensajes emergentes. |
| [js/incident-detail.js](js/incident-detail.js) | Controla la vista de detalle de incidentes y otras acciones asociadas. |
| [js/utils.js](js/utils.js) | Funciones auxiliares reutilizables. |

## 3. Base de datos

### Motor utilizado

No se utiliza MySQL, Firebase, SQLite ni ningún motor de base de datos externo. El proyecto persiste sus datos en el almacenamiento local del navegador mediante Local Storage.

### Dónde está definida la conexión

No existe un archivo de conexión a base de datos ni un backend que la administre. La lógica de persistencia está concentrada en [js/BdD.js](js/BdD.js), donde se leen y escriben valores directamente en Local Storage del navegador.

### Estructura de datos utilizada

Aunque no hay tablas SQL ni colecciones NoSQL, el sistema maneja datos conceptuales almacenados como claves en Local Storage:

- incidents: almacena los incidentes registrados.
- users: almacena los usuarios del sistema.
- acciones_dashboard: guarda la actividad reciente para el dashboard.
- comments_<id_del_incidente>: guarda comentarios asociados a cada incidente.
- logged, usuario, rol, nombre: almacenan la sesión activa del usuario.

### Esquema o script de base de datos

No existe un archivo como schema.sql, migrations.sql o equivalente. El estado inicial de la aplicación se genera en memoria mediante datos semilla dentro de [js/BdD.js](js/BdD.js).

### Servicio externo

No aplica. No hay servicios externos de base de datos ni credenciales de conexión que configurar. Para ejecutar el proyecto localmente no se requiere un servidor de base de datos.

## 4. Cómo ejecutar el proyecto localmente

1. Abrir la carpeta del repositorio en Visual Studio Code.
2. Ejecutar la extensión Live Server o abrir [index.html](index.html) en el navegador.
3. Si se usa Live Server, el puerto configurado está definido en [.vscode/settings.json](.vscode/settings.json) como 5502.
4. Iniciar sesión con uno de los usuarios de prueba predefinidos:
   - Usuario: admin / Contraseña: 123
   - Usuario: cliente / Contraseña: 123
   - Usuario: carlos / Contraseña: 123
   - Usuario: diana / Contraseña: 123
   - Usuario: fabian / Contraseña: 123
5. Los datos se guardan en el navegador, por lo que persisten solo en esa máquina y en ese perfil del navegador.

## 5. Funcionalidades implementadas

- Autenticación y sesión de usuarios: lógica en [js/login.js](js/login.js) y [js/BdD.js](js/BdD.js).
- Registro y gestión de usuarios: implementado en [js/users.js](js/users.js).
- Creación y consulta de incidentes: implementado en [js/incidents.js](js/incidents.js).
- Cambio de estados y tablero Kanban: implementado en [js/kanban.js](js/kanban.js).
- Dashboard operativo con métricas: implementado en [js/dashboard.js](js/dashboard.js).
- Reportes y filtros: implementado en [js/reports.js](js/reports.js).
- Recuperación de contraseña: implementado en [js/password-recovery.js](js/password-recovery.js).
