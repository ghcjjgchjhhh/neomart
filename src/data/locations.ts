import { getLGAsByState, getStateByName, getStates } from '@some19ice/nigeria-geo-core';

export const nigerianStates = getStates().map((state) => state.name);

export const getStateId = (stateName: string) => getStateByName(stateName)?.id || '';

export const getLocalGovernmentAreas = (stateName: string) => {
  const stateId = getStateId(stateName);
  return getLGAsByState(stateId).map((lga) => lga.name);
};

// Kept as a compatibility export for older consumers. New checkout code uses the LGA API above.
export const stateCities: Record<string, string[]> = {};
