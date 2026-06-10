import {createFromIconfontCN} from '@ant-design/icons';

const AntIconFont = createFromIconfontCN({
    scriptUrl: [
        '/iconfont/iconfont.js',
    ],
});

export function IconFont({type, className, useSvg = false}
                         : { type: string; className?: string, useSvg?: boolean }) {
    if (useSvg) {
        return <AntIconFont type={type} className={className ?? ''}/>
    } else {
        return <i className={`iconfont ${type} ${className ?? ''}`}></i>;
    }
}

export enum IconType {
    "wangzhantubiao" = 'icon-yuangongpaiban',
    "wodepaiban" = 'icon-people',
    "quankepaiban" = 'icon-duoren',
    "yuyuexiejia" = 'icon-yuyue',
    "qiwangpaiban" = 'icon-qiwangpaiban',
    "jiaqinshenqing" = 'icon-jiaqinshenqing',
    "tongji" = 'icon-tongji',
    "paibangongju" = 'icon-attend-checkin-record',
    "wodepaibangeren" = 'icon-ai59',
    'shangbannian' = 'icon-shangban',
    'xiabannian' = 'icon-xiaban',
    'yigeyuefen' = 'icon-GOAtubiao_anyuetongji',
    'huanban' = 'icon-huanban',
    'qingjia' = 'icon-qingjia',
    'gaiban' = 'icon-xiugaibanjixinxi',
    'gerentongji' = 'icon-gerentongjiguanli',
    'qitatongji' = 'icon-qitatongji',
    'xiujialeixing' = 'icon-shilileixing',
    'kaishipaiban' = 'icon-mk-pbgl',
    'qingkongpaiban' = 'icon-qingkongpaibanbiao',
    'hechapaiban' = 'icon-yanshoubaobeijihecha-16px',
    'tijiaopaiban' = 'icon-fasongtijiao',
    'shenhepaiban' = 'icon-shenhe',
    'daochupaiban' = 'icon-daochu',
    'jiaqishezhi' = 'icon-taskbeifen',
    'piliangshezhi' = 'icon-piliangshezhi',
    'daishenhe' = 'icon-daishenhe'
}
