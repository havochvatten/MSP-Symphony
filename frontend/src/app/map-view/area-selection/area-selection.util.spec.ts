import { filterNationalAreas, filterUserAreas } from './area-selection.util';
import { NationalArea, UserAreaCategoryState } from '@data/area/area.interfaces';

describe('area-selection.util', () => {

  describe('filterUserAreas', () => {
    const mockCategories: UserAreaCategoryState[] = [
      {
        id: 1,
        name: 'Kategori A',
        en: 'Category A',
        visible: true,
        expanded: false,
        statePath: ['userArea', 'categories', 1],
        areas: {
          1: { id: 1, name: 'rivers', displayName: 'rivers', description: '', categoryId: 1, polygon: {} as any, feature: null as any, statePath: [], visible: true },
          2: { id: 2, name: 'lakes', displayName: 'lakes', description: '', categoryId: 1, polygon: {} as any, feature: null as any, statePath: [], visible: true }
        }
      },
      {
        id: 2,
        name: 'Kategori B',
        en: 'Category B',
        visible: true,
        expanded: false,
        statePath: ['userArea', 'categories', 2],
        areas: {
          3: { id: 3, name: 'coast', displayName: 'coast', description: '', categoryId: 2, polygon: {} as any, feature: null as any, statePath: [], visible: true }
        }
      }
    ];

    it('should return all categories when search is empty', () => {
      const result = filterUserAreas(mockCategories, '');
      expect(result.length).toBe(2);
      expect(Object.keys(result[0].areas).length).toBe(2);
    });

    it('should filter areas by name', () => {
      const result = filterUserAreas(mockCategories, 'rivers');
      expect(Object.keys(result[0].areas).length).toBe(1);
      expect(Object.values(result[0].areas)[0].name).toBe('rivers');
    });

    it('should be case insensitive', () => {
      const result = filterUserAreas(mockCategories, 'RIVERS');
      expect(Object.keys(result[0].areas).length).toBe(1);
    });

    it('should return empty areas when no match', () => {
      const result = filterUserAreas(mockCategories, 'xyz');
      expect(Object.keys(result[0].areas).length).toBe(0);
      expect(Object.keys(result[1].areas).length).toBe(0);
    });

    it('should filter across multiple categories', () => {
      const result = filterUserAreas(mockCategories, 'coast');
      expect(Object.keys(result[0].areas).length).toBe(0);
      expect(Object.keys(result[1].areas).length).toBe(1);
    });

    it('should trim whitespace in search', () => {
      const result = filterUserAreas(mockCategories, '  rivers  ');
      expect(Object.keys(result[0].areas).length).toBe(1);
    });
  });


  describe('filterNationalAreas', () => {
    const mockNationalAreas: NationalArea[] = [
      {
        type: 'MSP',
        en: 'Marine Spatial Planning',
        displayName: 'Havsplanering',
        groups: [
          {
            en: 'Areas',
            name: 'Områden',
            visible: true,
            expanded: false,
            statePath: ['area', 'MSP', 'groups', 'Areas'],
            areas: [
              { name: 'Bottniska viken', displayName: 'Bottniska viken', code: 'BV', searchdata: '', areaKm2: 0, polygon: {} as any, feature: {} as any, statePath: [], visible: true },
              { name: 'Östersjön', displayName: 'Östersjön', code: 'OS', searchdata: '', areaKm2: 0, polygon: {} as any, feature: {} as any, statePath: [], visible: true }
            ]
          }
        ]
      }
    ];

    it('should return all areas when search is empty', () => {
      const result = filterNationalAreas(mockNationalAreas, '');
      expect(result.length).toBe(1);
    });

    it('should filter areas by name', () => {
      const result = filterNationalAreas(mockNationalAreas, 'bottniska');
      expect(result[0].groups[0].areas.length).toBe(1);
      expect(result[0].groups[0].areas[0].name).toBe('Bottniska viken');
    });

    it('should return empty array when no match', () => {
      const result = filterNationalAreas(mockNationalAreas, 'xyz');
      expect(result.length).toBe(0);
    });

    it('should be case insensitive', () => {
      const result = filterNationalAreas(mockNationalAreas, 'ÖSTERSJÖN');
      expect(result[0].groups[0].areas.length).toBe(1);
    });
  });
});
