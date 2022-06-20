# ToolbarButtonComponent
A button component for map toolbar/controls.

## ToolbarButtonComponent

### Properties
```typescript
@Input() label?: string;
@Input() icon?: IconType = 'plus';
@Input() active = false;
@Input() disabled = false;
```

## ToolbarZoomButtonsComponent

### Properties
```typescript
@Output() zoomIn: EventEmitter<void> = new EventEmitter<void>();
@Output() zoomOut: EventEmitter<void> = new EventEmitter<void>();
```

## Example usage
```html
<app-toolbar-button label="Some label" icon="plus"></app-toolbar-button>
```
```html
<app-toolbar-zoom-button
  (zoomIn)="onZoomIn()"
  (zoomOut)="onZoomOut()">
</app-toolbar-zoom-button>
```
