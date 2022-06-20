# TabsComponent
A tabs component with FontAwesome icons.

## TabsComponent

### Properties
```typescript
@ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;
@Input() routeTabIdIsAvailable = false;
```

## TabComponent

### Properties
```typescript
@Input() title!: string;
@Input() icon?: IconDefinition
@Input() id!: string;
@Input() active!: boolean;
```

## Example usage
```html
<app-tabs [routeTabIdIsAvailable]="true">
  <app-tab id="ecosystem" title="Ekosystem" [icon]="faFish">
    Some content
  </app-tab>
  <app-tab id="load" title="Belastning" [icon]="faShip">
    Some other content
  </app-tab>
  <app-tab id="matrix" title="Matris" [icon]="faBraille">
    Even more content
  </app-tab>
</app-tabs>
```
