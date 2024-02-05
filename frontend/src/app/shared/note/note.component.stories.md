# NoteComponent
A simple closable note component.

## Properties
```typescript
@Input() active = true;
@Output() close = new EventEmitter();
```

## Example usage
```html
<app-note [active]="active" (closeNote)="closeNote()">
  Om du har justerat standardvärden i någon karta kan du spara den/de
  justerade kartorna för att sedan använda dem i dina beräkningar.
</app-note>
```
