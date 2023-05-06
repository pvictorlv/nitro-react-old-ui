import {FC, useEffect, useState} from 'react';
import {
    AchievementUtilities,
    LocalizeBadgeDescription,
    LocalizeBadgeName,
    LocalizeText,
    UnseenItemCategory
} from '../../../../api';
import {
    AutoGrid,
    Button,
    Column,
    Flex,
    Grid,
    LayoutBadgeImageView,
    LayoutCurrencyIcon,
    LayoutProgressBar,
    Text
} from '../../../../common';
import {useAchievements, useInventoryBadges, useInventoryUnseenTracker} from '../../../../hooks';
import {InventoryAchievementItemView} from './InventoryAchievementItemView';
import {AchievementBadgeView} from '../../../achievements/views';
import {Row} from 'react-bootstrap';

export const InventoryAchievementView: FC<{}> = props =>
{
    const [ isVisible, setIsVisible ] = useState(false);
    const {
        badgeCodes = [],
        activeBadgeCodes = [],
        selectedBadgeCode = null,
        isWearingBadge = null,
        canWearBadges = null,
        toggleBadge = null,
        getBadgeId = null,
        activate = null,
        deactivate = null
    } = useInventoryBadges();

    const {
        achievementCategories = [],
        selectedCategoryCode = null,
        setSelectedCategoryCode = null,
        achievementScore = 0,
        getProgress = 0,
        getMaxProgress = 0,
        selectedCategory = null,
        getAllAchievements = []
    } = useAchievements();

    const {isUnseen = null, removeUnseen = null} = useInventoryUnseenTracker();

    useEffect(() =>
    {
        if (!selectedBadgeCode || !isUnseen(UnseenItemCategory.ACHIEVEMENTS, getBadgeId(selectedBadgeCode))) return;

        removeUnseen(UnseenItemCategory.ACHIEVEMENTS, getBadgeId(selectedBadgeCode));
    }, [ selectedBadgeCode, isUnseen, removeUnseen, getBadgeId ]);

    useEffect(() =>
    {
        if (!isVisible) return;

        const id = activate();

        return () => deactivate(id);
    }, [ isVisible, activate, deactivate ]);

    useEffect(() =>
    {
        setIsVisible(true);

        return () => setIsVisible(false);
    }, []);

    return (
        <Flex fullWidth alignItems="start" justifyContent="start"
              className="text-black flex-column inventory-ach-main-view"
              gap={ 2 }>
            <Column fullWidth justifyContent={ 'start' } className={ 'inventory-ach-view overflow-auto' }>
                { getAllAchievements.map((achievement, index) =>
                {
                    return (
                        <Grid key={ index } alignItems="start" className={ 'flex-column inventory-ach-item p-2 ' }>
                            <Column size={ 1 } alignItems={ 'start' }>
                                <AchievementBadgeView achievement={ achievement }/>
                            </Column>
                            <Column size={ 11 } alignItems={ 'start' }>
                                <Text className={ 'text-volter-bold' } truncate>
                                    { LocalizeBadgeName(AchievementUtilities.getAchievementBadgeCode(achievement)) }
                                </Text>
                                <Text textBreak className={ 'text-volter' }>
                                    { LocalizeBadgeDescription(AchievementUtilities.getAchievementBadgeCode(achievement)) }
                                </Text>
                                { ((achievement.levelRewardPoints > 0) || (achievement.scoreLimit > 0)) &&
                                    <div className={ 'd-inline, text-volter' }>

                                        { (achievement.scoreLimit > 0) &&
                                            <Text>{ LocalizeText('achievements.details.progress', [ 'progress', 'limit' ], [ (achievement.currentPoints + achievement.scoreAtStartOfLevel).toString(), (achievement.scoreLimit + achievement.scoreAtStartOfLevel).toString() ]) }, </Text>

                                        }
                                        { (achievement.levelRewardPoints > 0) &&
                                            <Text truncate className="text-volter">
                                                { LocalizeText('achievements.details.reward') } { achievement.levelRewardPoints } pixels
                                            </Text>
                                        }
                                    </div> }
                            </Column>

                        </Grid>)
                }) }
            </Column>

            <Column fullWidth justifyContent="end" alignItems={ 'center' } gap={ 1 }
                    className={ 'inventory-ach-points' }>
                <Text variant={ 'white' }
                      textBreak> { LocalizeText('achievements.categories.totalprogress', [ 'progress', 'limit' ], [ getProgress.toString(), getMaxProgress.toString() ]) } </Text>
            </Column>
        </Flex>
    );
}
