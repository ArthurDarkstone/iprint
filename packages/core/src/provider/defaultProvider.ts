import type { PrintElementTypeGroupLike } from '../types'
import { PrintElementTypeGroup } from '../elements/PrintElementTypeGroup'

/**
 * Built-in element type provider, mirroring demo/hiprint's customElementTypeProvider.
 * Registers a "default" module with 常规 (regular) and 辅助 (auxiliary) groups.
 */
export class DefaultElementTypeProvider {
  addElementTypes(context: { addPrintElementTypes: (moduleName: string, groups: PrintElementTypeGroup[]) => void }): void {
    context.addPrintElementTypes('default', [
      new PrintElementTypeGroup('常规', [
        { tid: 'default.text', text: '文本', data: '', type: 'text' },
        { tid: 'default.image', text: '图片', data: '', type: 'image' },
        { tid: 'default.longText', text: '长文', data: '', type: 'longText' },
        {
          tid: 'default.table',
          field: 'table',
          text: '表格',
          type: 'table',
          groupFields: ['name'],
          groupFooterFormatter: 'function(group, option){ return \'这里自定义统计脚信息\' }',
          columns: [
            [
              { title: '行号', fixed: true, rowspan: 2, field: 'id', width: 70 },
              { title: '人员信息', colspan: 2 },
              { title: '销售统计', colspan: 2 },
            ],
            [
              { title: '姓名', align: 'left', field: 'name', width: 100 },
              { title: '性别', field: 'gender', width: 100 },
              { title: '销售数量', field: 'count', width: 100 },
              { title: '销售金额', field: 'amount', width: 100 },
            ],
          ],
        },
        { tid: 'default.tableCustom', title: '表格', type: 'tableCustom' },
        { tid: 'default.html', title: 'html', type: 'html' },
      ]),
      new PrintElementTypeGroup('辅助', [
        { tid: 'default.hline', text: '横线', type: 'hline' },
        { tid: 'default.vline', text: '竖线', type: 'vline' },
        { tid: 'default.rect', text: '矩形', type: 'rect' },
        { tid: 'default.oval', text: '椭圆', type: 'oval' },
      ]),
    ])
  }
}

export const defaultProvider: DefaultElementTypeProvider = new DefaultElementTypeProvider()
export type { PrintElementTypeGroupLike }
