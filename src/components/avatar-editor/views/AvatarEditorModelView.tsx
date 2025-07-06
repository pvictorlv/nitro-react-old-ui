import {Dispatch, FC, SetStateAction, useCallback, useEffect, useState} from 'react';
import {CategoryData, FigureData, IAvatarEditorCategoryModel, LocalizeText} from '../../../api';
import {Column, Flex, Grid, Text} from '../../../common';
import {AvatarEditorIcon} from './AvatarEditorIcon';
import {AvatarEditorFigureSetView} from './figure-set/AvatarEditorFigureSetView';
import {AvatarEditorPaletteSetView} from './palette-set/AvatarEditorPaletteSetView';
import {AvatarEditorFigurePreviewView} from './AvatarEditorFigurePreviewView';

const CATEGORY_FOOTBALL_GATE = [ 'ch', 'cp', 'lg', 'sh' ];

export interface AvatarEditorModelViewProps
{
  model: IAvatarEditorCategoryModel;
  gender: string;
  isFromFootballGate: boolean;
  figureData: FigureData;
  setGender: Dispatch<SetStateAction<string>>;
}

export const AvatarEditorModelView: FC<AvatarEditorModelViewProps> = props =>
{
  const {model = null, gender = null, setGender = null, isFromFootballGate = false, figureData = null} = props;
  const [ activeCategory, setActiveCategory ] = useState<CategoryData>(null);
  const [ maxPaletteCount, setMaxPaletteCount ] = useState(1);

  const selectCategory = useCallback((name: string) =>
  {
    const category = model.categories.get(name);

    if (!category) return;

    category.init();

    setActiveCategory(category);

    for (const part of category.parts)
    {
      if (!part || !part.isSelected) continue;

      setMaxPaletteCount(part.maxColorIndex || 1);

      break;
    }
  }, [ model ]);

  useEffect(() =>
  {
    model.init();

    for (const name of model.categories.keys())
    {
      selectCategory(name);

      break;
    }
  }, [ model, selectCategory ]);

  if (!model || !activeCategory) return null;

  return (
    <Grid>
      <Column size={ 8 } className={ 'main-avatar-editor' }>
        { model.canSetGender &&
          (<Flex className={ 'avatar-editor-select-header' }>
            <Flex center pointer className="category-item" gap={ 3 } onClick={ event => setGender(FigureData.MALE) }>
              <AvatarEditorIcon icon="male" selected={ (gender === FigureData.MALE) }/>

              <Text className={ 'text-volter-bold' }
                    variant={ 'white' }>{ LocalizeText('avatareditor.generic.boy') }</Text>
            </Flex>

            <Flex center pointer className="category-item" gap={ 3 }
                  onClick={ event => setGender(FigureData.FEMALE) }>
              <AvatarEditorIcon icon="female" selected={ (gender === FigureData.FEMALE) }/>
              <Text variant={ 'white' }
                    className={ 'text-volter-bold text-white' }>{ LocalizeText('avatareditor.generic.girl') }</Text>

            </Flex>
          </Flex>) }

        <Flex className={ 'avatar-editor-select-header' } visible={ !model.canSetGender }>
          { model.categories && (model.categories.size > 0) && Array.from(model.categories.keys()).map(name =>
          {
            const category = model.categories.get(name);

            return (
              (!isFromFootballGate || (isFromFootballGate && CATEGORY_FOOTBALL_GATE.includes(category.name))) && (
                <Flex center pointer key={ name } className="category-item"
                      onClick={ event => selectCategory(name) }>
                  <AvatarEditorIcon icon={ category.name } selected={ (activeCategory === category) }/>
                </Flex>)
            );
          }) }
        </Flex>
        <AvatarEditorFigureSetView model={ model } category={ activeCategory } isFromFootballGate={ isFromFootballGate }
                                   setMaxPaletteCount={ setMaxPaletteCount }/>
      </Column>
      <AvatarEditorFigurePreviewView figureData={ figureData }/>
      <Flex className={ 'grid g-col-12 flex-row light-grid-bg' } overflow="hidden">
        { (maxPaletteCount >= 1) &&
          <AvatarEditorPaletteSetView model={ model } category={ activeCategory }
                                      paletteSet={ activeCategory.getPalette(0) } paletteIndex={ 0 }/> }
        { (maxPaletteCount === 2) &&
          <AvatarEditorPaletteSetView model={ model } category={ activeCategory }
                                      paletteSet={ activeCategory.getPalette(1) } paletteIndex={ 1 }/> }
      </Flex>
    </Grid>
  );
}
