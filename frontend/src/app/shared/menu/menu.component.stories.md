# MenuComponent

A menu component with optional support for icons from FontAwesome.

## Properties

```typescript
@Output() navigate: EventEmitter<void> = new EventEmitter<void>();
@Input() menuItems?: MenuItem[];
```

## Types

### MenuItem

```typescript
interface MenuItem {
  url: string | any[];
  name: string;
  icon?: IconDefinition;
}
```

## Example usage

```html
<app-menu
  *ngIf="isOpen"
  (navigate)="onMenuNavigation()"
  [menuItems]="menuItems"
></app-menu>
```
