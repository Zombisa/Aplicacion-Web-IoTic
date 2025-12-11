import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas dinámicas - No prerender (renderizar solo en cliente)
  {
    path: 'usuarios/view/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'inventario/add-loan/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'inventario/view-item/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'inventario/edit-item/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'prestamos/pretamo/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/lista/:tipo',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/panel/formulario/:tipo',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/libros/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/capitulos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/cursos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/eventos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/revistas/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/software/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/tutorias_concluidas/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/tutorias_en_marcha/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/trabajo-eventos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/procesos/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/proceso-tecnica/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/comites/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/participacion-comites/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/jurado/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/editar/:tipo/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'productividad/material/:id',
    renderMode: RenderMode.Client
  },
  // Rutas estáticas - Prerender
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
