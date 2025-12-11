# ConfirmationModal

## Descripción
Componente modal reutilizable para mostrar diálogos de confirmación. Perfecto para acciones destructivas como eliminar elementos, confirmar cambios importantes, etc.

## Características
- ✅ Diseño responsive y moderno
- ✅ Animaciones suaves de entrada y salida
- ✅ Completamente personalizable
- ✅ Cierre con backdrop o botón cancelar
- ✅ Iconos configurables
- ✅ Estilos de botón personalizables

## Uso Básico

### Importar el componente
```typescript
import { ConfirmationModal } from './path/to/confirmation-modal';

@Component({
  imports: [ConfirmationModal],
  // ...
})
```

### Usar en template
```html
<app-confirmation-modal
  [isVisible]="showDeleteModal"
  [title]="'Eliminar Producto'"
  [message]="'¿Está seguro de que desea eliminar este producto? Esta acción no se puede deshacer.'"
  [confirmText]="'Eliminar'"
  [cancelText]="'Cancelar'"
  [confirmButtonClass]="'btn-danger'"
  [icon]="'fas fa-trash'"
  (confirmed)="onDeleteConfirmed()"
  (cancelled)="onDeleteCancelled()">
</app-confirmation-modal>
```

## Propiedades (Inputs)

| Propiedad | Tipo | Valor por defecto | Descripción |
|-----------|------|-------------------|-------------|
| `isVisible` | `boolean` | `false` | Controla la visibilidad del modal |
| `title` | `string` | `'Confirmar acción'` | Título del modal |
| `message` | `string` | `'¿Está seguro de que desea continuar?'` | Mensaje de confirmación |
| `confirmText` | `string` | `'Confirmar'` | Texto del botón de confirmación |
| `cancelText` | `string` | `'Cancelar'` | Texto del botón de cancelar |
| `confirmButtonClass` | `string` | `'btn-danger'` | Clase CSS del botón de confirmación |
| `icon` | `string` | `'fas fa-exclamation-triangle'` | Icono del modal |

## Eventos (Outputs)

| Evento | Descripción |
|--------|-------------|
| `confirmed` | Emitido cuando el usuario confirma la acción |
| `cancelled` | Emitido cuando el usuario cancela la acción |

## Clases de botón disponibles

- `btn-danger`: Rojo (para acciones destructivas)
- `btn-warning`: Amarillo (para advertencias)
- `btn-primary`: Azul (para acciones principales)
- `btn-success`: Verde (para confirmaciones)

## Ejemplos de uso

### Eliminar elemento
```typescript
export class MyComponent {
  showDeleteModal = false;

  onDelete(): void {
    this.showDeleteModal = true;
  }

  onDeleteConfirmed(): void {
    // Ejecutar lógica de eliminación
    this.deleteItem();
    this.showDeleteModal = false;
  }

  onDeleteCancelled(): void {
    this.showDeleteModal = false;
  }
}
```

### Confirmar cambios
```html
<app-confirmation-modal
  [isVisible]="showSaveModal"
  [title]="'Guardar Cambios'"
  [message]="'¿Desea guardar los cambios realizados?'"
  [confirmText]="'Guardar'"
  [confirmButtonClass]="'btn-primary'"
  [icon]="'fas fa-save'"
  (confirmed)="onSaveConfirmed()"
  (cancelled)="onSaveCancelled()">
</app-confirmation-modal>
```

### Cerrar sesión
```html
<app-confirmation-modal
  [isVisible]="showLogoutModal"
  [title]="'Cerrar Sesión'"
  [message]="'¿Está seguro de que desea cerrar sesión?'"
  [confirmText]="'Cerrar Sesión'"
  [confirmButtonClass]="'btn-warning'"
  [icon]="'fas fa-sign-out-alt'"
  (confirmed)="onLogoutConfirmed()"
  (cancelled)="onLogoutCancelled()">
</app-confirmation-modal>
```

## Estilos personalizados

El componente incluye estilos responsive y se adapta automáticamente a dispositivos móviles. En pantallas pequeñas, los botones se reorganizan verticalmente para mejor usabilidad.

## Notas de implementación

- El modal se cierra automáticamente al confirmar o cancelar
- Incluye blur backdrop para mejor experiencia visual
- Animaciones suaves con CSS y Angular Animations
- Z-index alto (9999) para aparecer sobre otros elementos
