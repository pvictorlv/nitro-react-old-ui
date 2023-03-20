import {FC, useEffect, useState} from 'react';
import {LocalizeBadgeDescription, LocalizeBadgeName, LocalizeText, UnseenItemCategory} from '../../../../api';
import {AutoGrid, Button, Column, Flex, Grid, LayoutBadgeImageView, Text} from '../../../../common';
import {useAchievements, useInventoryBadges, useInventoryUnseenTracker} from '../../../../hooks';
import {InventoryBadgeItemView} from './InventoryBadgeItemView';

export const InventoryBadgeView: FC<{}> = props =>
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
    const {isUnseen = null, removeUnseen = null} = useInventoryUnseenTracker();

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

    useEffect(() =>
    {
        if (!selectedBadgeCode || !isUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode))) return;

        removeUnseen(UnseenItemCategory.BADGE, getBadgeId(selectedBadgeCode));
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
        <Grid gap={ 1 }>
            <Column size={ 7 } overflow="hidden">
                <Text className={ 'text-volter-bold text-center' }>{ LocalizeText('badges_tab_title') }</Text>
                <AutoGrid columnCount={ 4 } className={'inventory-badge-list'}>
                    { badgeCodes && (badgeCodes.length > 0) && badgeCodes.map((badgeCode, index) =>
                    {
                        if (isWearingBadge(badgeCode)) return null;

                        return <InventoryBadgeItemView key={ index } badgeCode={ badgeCode }/>
                    }) }
                </AutoGrid>
            </Column>
            <Column className="justify-content-between" size={ 5 } overflow="auto">
                <Column overflow="hidden" gap={ 2 }>
                    <Text
                        className={ 'text-volter-bold text-center' }>{ LocalizeText('inventory.badges.activebadges') }</Text>
                    <AutoGrid columnCount={ 3 }>
                        { activeBadgeCodes && (activeBadgeCodes.length > 0) && activeBadgeCodes.map((badgeCode, index) =>
                            <InventoryBadgeItemView key={ index } badgeCode={ badgeCode }/>) }
                    </AutoGrid>
                </Column>

            </Column>
            { !!selectedBadgeCode &&
                <Column size={ 12 } className={ 'inventory-badge-data' }>
                    <Grid alignItems={ 'center' } className={ 'p-1' }>
                        <Column size={ 1 }>
                            <LayoutBadgeImageView shrink badgeCode={ selectedBadgeCode }/>
                        </Column>
                        <Column size={ 8 }>
                            <div className={ 'd-inline' }>
                                <Text className={ 'text-volter-bold d-block w-80' }>
                                    { LocalizeBadgeName(selectedBadgeCode) }
                                </Text>
                                <Text
                                    className={ 'text-volter d-inline' }>{ LocalizeBadgeDescription(selectedBadgeCode) }</Text>
                            </div>
                        </Column>
                        <Column size={ 3 }>
                            <Button variant={ 'primary' }
                                    disabled={ !isWearingBadge(selectedBadgeCode) && !canWearBadges() }
                                    onClick={ event => toggleBadge(selectedBadgeCode) }>{ LocalizeText(isWearingBadge(selectedBadgeCode) ? 'inventory.badges.clearbadge' : 'inventory.badges.wearbadge') }</Button>
                        </Column>
                    </Grid>
                </Column> }
            <Column size={ 12 } fullWidth justifyContent="end" alignItems={ 'center' } gap={ 1 }
                    className={ 'inventory-ach-points' }>
                <Text variant={ 'white' }
                      textBreak> { LocalizeText('achievements.categories.totalprogress', [ 'progress', 'limit' ], [ getProgress.toString(), getMaxProgress.toString() ]) } </Text>
            </Column>
        </Grid>
    );
}
