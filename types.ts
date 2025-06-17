
export interface UpdatableDevice {
  updateCapabilityValues(state: any): void;
}

export function isUpdatableDevice(obj: any): obj is UpdatableDevice {
  return obj && typeof obj.updateCapabilityValues === 'function';
}
