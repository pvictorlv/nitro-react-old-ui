import {
  AvatarEditorFigureCategory,
  FigureSetIdsMessageEvent,
  GetWardrobeMessageComposer,
  IAvatarFigureContainer,
  ILinkEventTracker,
  SetClothingChangeDataMessageComposer,
  UserFigureComposer,
  UserWardrobePageEvent
} from '@nitrots/nitro-renderer';
import {FC, useCallback, useEffect, useMemo, useState} from 'react';
import {FaDice, FaTrash, FaUndo} from 'react-icons/fa';
import {
  AddEventLinkTracker,
  AvatarEditorAction,
  AvatarEditorUtilities,
  BodyModel,
  FigureData,
  generateRandomFigure,
  GetAvatarRenderManager,
  GetClubMemberLevel,
  GetConfiguration,
  GetSessionDataManager,
  HeadModel,
  IAvatarEditorCategoryModel,
  LegModel,
  LocalizeText,
  RemoveLinkEventTracker,
  SendMessageComposer,
  TorsoModel
} from '../../api';
import {
  Button,
  ButtonGroup,
  Column, Flex,
  Grid,
  NitroCardContentView,
  NitroCardHeaderView,
  NitroCardTabsItemView,
  NitroCardTabsView,
  NitroCardView
} from '../../common';
import {useMessageEvent} from '../../hooks';
import {AvatarEditorFigurePreviewView} from './views/AvatarEditorFigurePreviewView';
import {AvatarEditorModelView} from './views/AvatarEditorModelView';
import {AvatarEditorWardrobeView} from './views/AvatarEditorWardrobeView';

const DEFAULT_MALE_FIGURE: string = 'hr-100.hd-180-7.ch-215-66.lg-270-79.sh-305-62.ha-1002-70.wa-2007';
const DEFAULT_FEMALE_FIGURE: string = 'hr-515-33.hd-600-1.ch-635-70.lg-716-66-62.sh-735-68';
const DEFAULT_MALE_FOOTBALL_GATE: string = 'ch-3109-92-1408.lg-3116-82-1408.sh-3115-1408-1408';
const DEFAULT_FEMALE_FOOTBALL_GATE: string = 'ch-3112-1408-1408.lg-3116-71-1408.sh-3115-1408-1408';

export const AvatarEditorView: FC<{}> = props =>
{
  const [ isVisible, setIsVisible ] = useState(false);
  const [ figures, setFigures ] = useState<Map<string, FigureData>>(null);
  const [ figureData, setFigureData ] = useState<FigureData>(null);
  const [ categories, setCategories ] = useState<Map<string, IAvatarEditorCategoryModel>>(null);
  const [ activeCategory, setActiveCategory ] = useState<IAvatarEditorCategoryModel>(null);
  const [ figureSetIds, setFigureSetIds ] = useState<number[]>([]);
  const [ boundFurnitureNames, setBoundFurnitureNames ] = useState<string[]>([]);
  const [ savedFigures, setSavedFigures ] = useState<[ IAvatarFigureContainer, string ][]>([]);
  const [ isWardrobeVisible, setIsWardrobeVisible ] = useState(false);
  const [ lastFigure, setLastFigure ] = useState<string>(null);
  const [ lastGender, setLastGender ] = useState<string>(null);
  const [ needsReset, setNeedsReset ] = useState(true);
  const [ isInitalized, setIsInitalized ] = useState(false);

  const [ genderFootballGate, setGenderFootballGate ] = useState<string>(null);
  const [ objectFootballGate, setObjectFootballGate ] = useState<number>(null);

  const maxWardrobeSlots = useMemo(() => GetConfiguration<number>('avatar.wardrobe.max.slots', 10), []);

  const onClose = () =>
  {
    setGenderFootballGate(null);
    setObjectFootballGate(null);
    setIsVisible(false);
  }

  useMessageEvent<FigureSetIdsMessageEvent>(FigureSetIdsMessageEvent, event =>
  {
    const parser = event.getParser();

    setFigureSetIds(parser.figureSetIds);
    setBoundFurnitureNames(parser.boundsFurnitureNames);
  });

  useMessageEvent<UserWardrobePageEvent>(UserWardrobePageEvent, event =>
  {
    const parser = event.getParser();
    const savedFigures: [ IAvatarFigureContainer, string ][] = [];

    let i = 0;

    while (i < maxWardrobeSlots)
    {
      savedFigures.push([ null, null ]);

      i++;
    }

    for (let [ index, [ look, gender ] ] of parser.looks.entries())
    {
      const container = GetAvatarRenderManager().createFigureContainer(look);

      savedFigures[(index - 1)] = [ container, gender ];
    }

    setSavedFigures(savedFigures);
  });

  const selectCategory = useCallback((name: string) =>
  {
    if (!categories) return;

    setActiveCategory(categories.get(name));
  }, [ categories ]);

  const resetCategories = useCallback(() =>
  {
    const categories = new Map();

    if (!genderFootballGate)
    {
      categories.set(AvatarEditorFigureCategory.GENERIC, new BodyModel());
      categories.set(AvatarEditorFigureCategory.HEAD, new HeadModel());
      categories.set(AvatarEditorFigureCategory.TORSO, new TorsoModel());
      categories.set(AvatarEditorFigureCategory.LEGS, new LegModel());
    }
    else
    {
      categories.set(AvatarEditorFigureCategory.TORSO, new TorsoModel());
      categories.set(AvatarEditorFigureCategory.LEGS, new LegModel());
    }


    setCategories(categories);
  }, [ genderFootballGate ]);

  const setupFigures = useCallback(() =>
  {
    const figures: Map<string, FigureData> = new Map();

    const maleFigure = new FigureData();
    const femaleFigure = new FigureData();

    maleFigure.loadAvatarData(DEFAULT_MALE_FIGURE, FigureData.MALE);
    femaleFigure.loadAvatarData(DEFAULT_FEMALE_FIGURE, FigureData.FEMALE);

    figures.set(FigureData.MALE, maleFigure);
    figures.set(FigureData.FEMALE, femaleFigure);

    setFigures(figures);
    setFigureData(figures.get(FigureData.MALE));
  }, []);

  const loadAvatarInEditor = useCallback((figure: string, gender: string, reset: boolean = true) =>
  {
    gender = AvatarEditorUtilities.getGender(gender);

    let newFigureData = figureData;

    if (gender !== newFigureData.gender) newFigureData = figures.get(gender);

    if (figure !== newFigureData.getFigureString()) newFigureData.loadAvatarData(figure, gender);

    if (newFigureData !== figureData) setFigureData(newFigureData);

    if (reset)
    {
      setLastFigure(figureData.getFigureString());
      setLastGender(figureData.gender);
    }
  }, [ figures, figureData ]);

  const processAction = useCallback((action: string) =>
  {
    switch (action)
    {
      case AvatarEditorAction.ACTION_CLEAR:
        loadAvatarInEditor(figureData.getFigureStringWithFace(0, false), figureData.gender, false);
        resetCategories();
        return;
      case AvatarEditorAction.ACTION_RESET:
        loadAvatarInEditor(lastFigure, lastGender);
        resetCategories();
        return;
      case AvatarEditorAction.ACTION_RANDOMIZE:
        const figure = generateRandomFigure(figureData, figureData.gender, GetClubMemberLevel(), figureSetIds, [ FigureData.FACE ]);

        loadAvatarInEditor(figure, figureData.gender, false);
        resetCategories();
        return;
      case AvatarEditorAction.ACTION_SAVE:
        if (!genderFootballGate)
        {
          SendMessageComposer(new UserFigureComposer(figureData.gender, figureData.getFigureString()));
        }
        else
        {
          SendMessageComposer(new SetClothingChangeDataMessageComposer(objectFootballGate, genderFootballGate, figureData.getFigureString()));
        }

        onClose();

        setIsVisible(false);
        return;
    }
  }, [ loadAvatarInEditor, figureData, resetCategories, lastFigure, lastGender, figureSetIds, genderFootballGate, objectFootballGate ])

  const setGender = useCallback((gender: string) =>
  {
    gender = AvatarEditorUtilities.getGender(gender);

    setFigureData(figures.get(gender));
  }, [ figures ]);

  useEffect(() =>
  {
    const linkTracker: ILinkEventTracker = {
      linkReceived: (url: string) =>
      {
        const parts = url.split('/');

        if (parts.length < 2) return;

        setGenderFootballGate(parts[2] ? parts[2] : null);
        setObjectFootballGate(parts[3] ? Number(parts[3]) : null);

        switch (parts[1])
        {
          case 'show':
            setIsVisible(true);
            return;
          case 'hide':
            setIsVisible(false);
            return;
          case 'toggle':
            setIsVisible(prevValue => !prevValue);
            return;
        }
      },
      eventUrlPrefix: 'avatar-editor/'
    };

    AddEventLinkTracker(linkTracker);

    return () => RemoveLinkEventTracker(linkTracker);
  }, []);

  useEffect(() =>
  {
    setSavedFigures(new Array(maxWardrobeSlots));
  }, [ maxWardrobeSlots ]);

  useEffect(() =>
  {
    if (!isWardrobeVisible) return;

    setActiveCategory(null);
    SendMessageComposer(new GetWardrobeMessageComposer());
  }, [ isWardrobeVisible ]);

  useEffect(() =>
  {
    if (!activeCategory) return;

    setIsWardrobeVisible(false);
  }, [ activeCategory ]);

  useEffect(() =>
  {
    if (!categories) return;

    selectCategory(!genderFootballGate ? AvatarEditorFigureCategory.GENERIC : AvatarEditorFigureCategory.TORSO);
  }, [ categories, genderFootballGate, selectCategory ]);


  useEffect(() =>
  {
    if (!figureData) return;

    AvatarEditorUtilities.CURRENT_FIGURE = figureData;

    resetCategories();

    return () => AvatarEditorUtilities.CURRENT_FIGURE = null;
  }, [ figureData, resetCategories ]);

  useEffect(() =>
  {
    AvatarEditorUtilities.FIGURE_SET_IDS = figureSetIds;
    AvatarEditorUtilities.BOUND_FURNITURE_NAMES = boundFurnitureNames;

    resetCategories();

    return () =>
    {
      AvatarEditorUtilities.FIGURE_SET_IDS = null;
      AvatarEditorUtilities.BOUND_FURNITURE_NAMES = null;
    }
  }, [ figureSetIds, boundFurnitureNames, resetCategories ]);

  useEffect(() =>
  {
    if (!isVisible) return;

    if (!figures)
    {
      setupFigures();

      setIsInitalized(true);

      return;
    }
  }, [ isVisible, figures, setupFigures ]);

  useEffect(() =>
  {
    if (!isVisible || !isInitalized || !needsReset) return;

    loadAvatarInEditor(!genderFootballGate ? GetSessionDataManager().figure : (genderFootballGate === FigureData.MALE ? DEFAULT_MALE_FOOTBALL_GATE : DEFAULT_FEMALE_FOOTBALL_GATE), !genderFootballGate ? GetSessionDataManager().gender : genderFootballGate);
    setNeedsReset(false);
  }, [ isVisible, isInitalized, needsReset, loadAvatarInEditor, genderFootballGate ]);

  useEffect(() =>
  {
    if (isVisible) return;

    return () =>
    {
      setNeedsReset(true);
    }
  }, [ isVisible, genderFootballGate ]);

  if (!isVisible || !figureData) return null;

  return (
    <NitroCardView uniqueKey="avatar-editor" className="nitro-avatar-editor" theme={ 'wired' }>
      <NitroCardHeaderView
        headerText={ !genderFootballGate ? LocalizeText('avatareditor.title') : LocalizeText('widget.furni.clothingchange.editor.title') }
        onCloseClick={ onClose }/>
      <NitroCardTabsView className={ 'px-4' }>
        { categories && (categories.size > 0) && Array.from(categories.keys()).map(category =>
        {
          const isActive = (activeCategory && (activeCategory.name === category));

          return (
            <NitroCardTabsItemView key={ category } isActive={ isActive }
                                   onClick={ event => selectCategory(category) }>
              <div className={ 'nitro-avatar-editor-header-icon ' + category }></div>
            </NitroCardTabsItemView>
          );
        }) }
        { (!genderFootballGate) &&
          <NitroCardTabsItemView isActive={ isWardrobeVisible } onClick={ event => setIsWardrobeVisible(true) }>
            { LocalizeText('avatareditor.category.wardrobe') }
          </NitroCardTabsItemView>
        }
      </NitroCardTabsView>
      <NitroCardContentView className={ 'pt-0' }>
        <Grid className={ 'px-2' }>
          <Column size={ 12 } overflow="hidden" className={ 'avatar-editor-content' }>
            { (activeCategory && !isWardrobeVisible) &&
              <AvatarEditorModelView isFromFootballGate={ genderFootballGate } figureData={ figureData }
                                     model={ activeCategory }
                                     gender={ figureData.gender } setGender={ setGender }/> }
            { isWardrobeVisible &&
              <AvatarEditorWardrobeView figureData={ figureData } savedFigures={ savedFigures }
                                        setSavedFigures={ setSavedFigures }
                                        loadAvatarInEditor={ loadAvatarInEditor }/> }
          </Column>
          { (!genderFootballGate) &&
            <Column size={ 12 } overflow="hidden">
              <Flex grow gap={ 1 }>
                <Flex grow>
                  <Button variant="primary"
                          onClick={ event => processAction(AvatarEditorAction.ACTION_RESET) }>
                    <FaUndo className="fa-icon"/>
                  </Button>
                  <Button variant="primary"
                          onClick={ event => processAction(AvatarEditorAction.ACTION_CLEAR) }>
                    <FaTrash className="fa-icon"/>
                  </Button>
                  <Button variant="primary"
                          onClick={ event => processAction(AvatarEditorAction.ACTION_RANDOMIZE) }>
                    <FaDice className="fa-icon"/>
                  </Button>
                </Flex>
                <Button
                  onClick={ event => processAction(AvatarEditorAction.ACTION_SAVE) }>
                  { LocalizeText('avatareditor.save') }
                </Button>
              </Flex>
            </Column>
          }
        </Grid>
      </NitroCardContentView>
    </NitroCardView>
  );
}
