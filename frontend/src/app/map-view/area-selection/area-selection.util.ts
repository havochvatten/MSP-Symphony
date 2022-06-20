import { UserArea, AreaGroup, NationalArea } from '@data/area/area.interfaces';

function searchTrim(search: string) {
  return search.trim().toLowerCase();
}

export function filterNationalAreas(nationalAreas: NationalArea[], search: string): NationalArea[] {
  if (search === '') {
    return nationalAreas;
  }
  search = searchTrim(search);
  return nationalAreas.reduce((filteredNationalAreas: NationalArea[], nationalArea) => {
    const filteredGroups = filterAreas(nationalArea.groups, search);
    return [
      ...filteredNationalAreas,
      ...(filteredGroups.length > 0
        ? [
            {
              ...nationalArea,
              groups: filteredGroups
            }
          ]
        : [])
    ];
  }, []);
}

function filterAreas(areaGroups: AreaGroup[], search: string): AreaGroup[] {
  return areaGroups.reduce((groups: AreaGroup[], areaGroup: AreaGroup) => {
    const areas = areaGroup.areas.filter(area =>
      (area.searchdata ? area.searchdata : area.name)
        .trim()
        .toLowerCase()
        .includes(search)
    );
    return [
      ...groups,
      ...(areas.length > 0
        ? [
            {
              ...areaGroup,
              areas
            }
          ]
        : [])
    ];
  }, []);
}

export function filterUserAreas(userAreas: UserArea[], search: string): UserArea[] {
  if (search === '') {
    return userAreas;
  }
  search = searchTrim(search);
  return userAreas.filter(userArea =>
    userArea.name
      .trim()
      .toLowerCase()
      .includes(search)
  );
}
