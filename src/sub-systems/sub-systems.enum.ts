export enum SystemTypeEnum {
  GARDEN_WATERING = 'garden-watering',
  LIGHTING = 'lighting',
  BOILER = 'boiler',
  VENTILATION = 'ventilation',
  POOL = 'pool',
  WASTE_WATER_PUMP = 'waste-water-pump',
}

export type SystemTypeType =
  | 'garden-watering'
  | 'lighting'
  | 'boiler'
  | 'ventilation'
  | 'pool'
  | 'waste-water-pump';

export const SystemTypeArray = [
  SystemTypeEnum.GARDEN_WATERING,
  SystemTypeEnum.LIGHTING,
  SystemTypeEnum.BOILER,
  SystemTypeEnum.VENTILATION,
  SystemTypeEnum.POOL,
  SystemTypeEnum.WASTE_WATER_PUMP,
];
