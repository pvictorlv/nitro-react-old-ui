import {useEffect, useState} from 'react';
import {useBetween} from 'use-between';
import {GetConfiguration, SendMessageComposer, UnseenItemCategory} from '../../api';
import {useMessageEvent} from '../events';
import {useSharedVisibility} from '../useSharedVisibility';
import {useInventoryUnseenTracker} from './useInventoryUnseenTracker';
import {
  AvatarEffect,
  AvatarEffectActivatedComposer,
  AvatarEffectActivatedEvent, AvatarEffectAddedEvent,
  AvatarEffectsEvent
} from '@nitrots/nitro-renderer';

const useInventoryEffectsState = () =>
{
  const [ needsUpdate, setNeedsUpdate ] = useState(true);
  const [ effectCodes, setEffectCodes ] = useState<number[]>([]);
  const [ effectsData, setEffectsData ] = useState<Map<number, AvatarEffect>>(new Map<number, AvatarEffect>());
  const [ activeEffectCode, setActiveEffectCode ] = useState<number>(0);
  const [ selectedEffectCode, setSelectedEffectCode ] = useState<number>(null);
  const {isVisible = false, activate = null, deactivate = null} = useSharedVisibility();
  const {isUnseen = null, resetCategory = null} = useInventoryUnseenTracker();
  const [effectQuantity, setEffectQuantity] = useState<Map<number, number>>(new Map<number, number>());

  const isWearingEffect = (effectCode: number) => (activeEffectCode == effectCode);

  const toggleEffect = (effectCode: number) =>
  {
    setActiveEffectCode(prevValue =>
    {
      if (prevValue === effectCode) return 0;

      if (!effectCodes.includes(effectCode)) return prevValue;

      const composer = new AvatarEffectActivatedComposer(effectCode);

      SendMessageComposer(composer);

      return effectCode;
    })

  }

  useMessageEvent<AvatarEffectsEvent>(AvatarEffectsEvent, event =>
  {
    const parser = event.getParser();
    const effectsToAdd: number[] = [];

    setEffectsData(prevValue =>
    {
      const newValue = new Map(prevValue);

      parser.effects.forEach(effect =>
      {
        const exists = effectCodes.indexOf(effect.type) >= 0;

        if (exists) return;

        effectsToAdd.push(effect.type);
        newValue.set(effect.type, effect);
      });

      return newValue;
    });

    setEffectQuantity(prevValue =>
    {
      const newValue = new Map(prevValue);

      parser.effects.forEach(effect =>
      {
        if (newValue.has(effect.type)) {
          newValue.set(effect.type, newValue.get(effect.type) + 1);
          return;
        }

        newValue.set(effect.type, 1);
      });

      return newValue;
    });

    setEffectCodes(prev => [ ...prev, ...effectsToAdd ]);
  });

  useMessageEvent<AvatarEffectActivatedEvent>(AvatarEffectActivatedEvent, event =>
  {
    const parser = event.getParser();
    setActiveEffectCode(parser.type);

    setSelectedEffectCode(prevValue =>
    {
      let newValue = prevValue;

      if (newValue && (newValue !== parser.type)) newValue = null;

      if (!newValue) newValue = parser.type;

      return newValue;
    });
  });

  useMessageEvent<AvatarEffectAddedEvent>(AvatarEffectAddedEvent, event =>
  {
    const parser = event.getParser();

    setEffectCodes(prevValue =>
    {
      const newValue = [ ...prevValue ];

      newValue.push(parser.type);

      return newValue;
    });

    setEffectsData(prevValue =>
    {
      const newValue = new Map(prevValue);

      let effect = new AvatarEffect();
      effect.type = parser.type;
      effect.subType = parser.subType;
      effect.duration = parser.duration;
      effect.inactiveEffectsInInventory = 0;
      effect.secondsLeftIfActive = parser.duration;
      newValue.set(parser.type, effect);

      return newValue;
    });
  });

  useEffect(() =>
  {
    if (!effectCodes || !effectCodes.length) return;

    setSelectedEffectCode(prevValue =>
    {
      let newValue = prevValue;

      if (newValue && (effectCodes.indexOf(newValue) === -1)) newValue = null;

      if (!newValue) newValue = effectCodes[0];

      return newValue;
    });
  }, [ effectCodes ]);



  return {
    effectCodes,
    activeEffectCode,
    selectedEffectCode,
    setSelectedEffectCode,
    isWearingEffect,
    effectsData,
    effectQuantity,
    toggleEffect,
    activate,
    deactivate
  };
}

export const useInventoryEffects = () => useBetween(useInventoryEffectsState);
