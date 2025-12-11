# loading

## Descripción
Componente reutilizable que muestra una pantalla de carga animada mientras se cargan datos o se realizan operaciones asíncronas. Proporciona feedback visual al usuario durante procesos que requieren tiempo de espera.

## Características
- Pantalla de carga de pantalla completa con overlay
- Animación double bounce suave y profesional
- Gradiente personalizable que sigue los estilos del proyecto
- Servicio centralizado para control global

## Arquitectura
El sistema consta de dos componentes principales:

### LoadingComponent
- **Ubicación**: `components/loading/`
- **Archivos**: 
  - `loading.component.ts` - Componente standalone
  - `loading.component.html` - Template con animación
  - `loading.component.css` - Estilos y keyframes

### LoadingService
- **Ubicación**: `services/loading.service.ts`
- **Tipo**: Injectable con `providedIn: 'root'`
- **Función**: Controla el estado de visibilidad del loading mediante Observable

## Cómo funciona

1. **El servicio mantiene un Observable** (`loading$`) que emite valores booleanos (true/false)
2. **El componente se suscribe** al Observable usando `| async` en el template
3. **Cuando se llama a `show()`**, el Observable emite `true` y el `*ngIf` muestra el loading
4. **Cuando se llama a `hide()`**, el Observable emite `false` y el `*ngIf` oculta el loading

## Uso

### 1. Importar en tu componente

```typescript
import { LoadingService } from './services/loading.service';
import { LoadingComponent } from './components/loading/loading.component';

@Component({
  imports: [CommonModule, LoadingComponent],
  // ...
})
export class TuComponente {
  constructor(public loadingService: LoadingService) {}
}
```


### 2. Agregar en el HTML
```html
<!-- Muestra el loading cuando loading$ = true -->
<app-loading *ngIf="loadingService.loading$ | async"></app-loading>

<!-- Muestra el contenido cuando loading$ = false -->
<div *ngIf="!(loadingService.loading$ | async)">
  <!-- Tu contenido aquí -->
</div>
```

### 3. Controlar desde el código
```typescript
async loadData() {
  this.loadingService.show(); // Muestra el loading
  
  try {
    await this.getData(); // Operación asíncrona
  } catch (error) {
    console.error(error);
  } finally {
    this.loadingService.hide(); // Oculta el loading
  }
}
```

## Parámetros

### LoadingService

#### Métodos públicos
- `show()`: Muestra la pantalla de carga
- `hide()`: Oculta la pantalla de carga

#### Propiedades públicas
- `loading$`: Observable<boolean> - Estado actual del loading

## Personalización

### Colores
Los colores se toman de las variables CSS globales:
```css
:root {
  --color-primary: #2d3561;  /* Color del fondo degradado */
  --color-secondary: #f59e0b; /* Color de la animación */
}
```

### Velocidad de animación
Modificar en `loading.component.css`:
```css
.double-bounce1, .double-bounce2 {
  animation: bounce 2s infinite ease-in-out; /* Cambiar 2s */
}
```

## Notas importantes
- El componente es standalone, no requiere módulo
- El servicio es singleton (`providedIn: 'root'`)
- El `*ngIf` con `| async` se desuscribe automáticamente
- Se recomienda siempre usar try-catch-finally para garantizar que se oculte el loading