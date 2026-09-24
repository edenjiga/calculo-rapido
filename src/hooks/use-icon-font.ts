import { useFonts } from 'expo-font';
import regular from 'expo-symbols/androidWeights/regular';

/**
 * Android and web draw `SymbolView` icons with the Material Symbols font. Loading it
 * before the first screen keeps icons from showing up as empty boxes.
 */
export function useIconFont() {
  const [loaded, error] = useFonts({ [regular.name]: regular.font });
  return loaded || error != null;
}
