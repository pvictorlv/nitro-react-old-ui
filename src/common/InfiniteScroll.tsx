import { FC, Fragment, useEffect, useRef, useState } from 'react';
import { useVirtualizer, VirtualItem } from '@tanstack/react-virtual';
import { Base } from './Base';

interface InfiniteScrollProps<T = any> {
  rows: T[];
  overscan?: number;
  scrollToBottom?: boolean;
  rowRender: (row: T) => React.ReactElement;
}

export const InfiniteScroll: FC<InfiniteScrollProps> = ({
                                                          rows = [],
                                                          overscan = 5,
                                                          scrollToBottom = false,
                                                          rowRender,
                                                        }) => {
  // Índice para onde rolar
  const [scrollIndex, setScrollIndex] = useState(rows.length - 1);
  const parentRef = useRef<HTMLDivElement>(null);

  // Inicializa o virtualizer
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    overscan,
    estimateSize: () => 50, // ajuste ou receba via props se as linhas tiverem altura variável
  });

  // Lista de itens virtuais e tamanho total
  const virtualItems = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();

  // Quando habilitado, rola para o índice desejado
  useEffect(() => {
    if (scrollToBottom) {
      virtualizer.scrollToIndex(scrollIndex, { align: 'end' });
    }
  }, [scrollToBottom, scrollIndex, virtualizer]);

  // Cálculo dos paddings
  const paddingTop = virtualItems.length > 0 ? virtualItems[0].start : 0;
  const paddingBottom =
    virtualItems.length > 0
      ? totalSize - virtualItems[virtualItems.length - 1].end
      : 0;

  return (
    <Base fit innerRef={parentRef} position="relative" overflow="auto">
      {paddingTop > 0 && <div style={{ height: paddingTop }} />}
      {virtualItems.map((virtualRow: VirtualItem) => {
        const rowData = rows[virtualRow.index];
        if (!rowData) {
          return <Fragment key={virtualRow.key} />;
        }
        return (
          <div
            key={virtualRow.key}
            data-index={virtualRow.index}
            // ref necessário para medir cada elemento e ajustar o layout
            ref={virtualizer.measureElement}
            style={{ transform: `translateY(${virtualRow.start}px)` }}
          >
            {rowRender(rowData)}
          </div>
        );
      })}
      {paddingBottom > 0 && <div style={{ height: paddingBottom }} />}
    </Base>
  );
};
