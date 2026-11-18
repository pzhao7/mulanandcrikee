import PropTypes from 'prop-types';
import React, { useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from 'src/components/Layout';

// 照片放在仓库 static/plants/，Gatsby 构建时会原样复制到 public/plants/，
// 页面直接用 URL 引用（不走 import：这个站的 webpack 配置没有处理 .jpg 的规则，
// import 会导致构建失败，见 README「为什么照片放在 static/ 而不是 assets/」）。

// 小区植物图鉴：散步时拍到的植物，按发现顺序编号。
// 新植物平时只记进图鉴，攒一批再定期同步到这个页面。
const PLANTS = [
  {
    no: 'No. 001',
    nameZh: '火棘',
    nameEn: 'Firethorn',
    latin: 'Pyracantha',
    location: 'High Street Park, Issaquah Highlands',
    date: '2026-11-15',
    points: '常绿灌木，秋季结满密集的亮橙色小果。',
    description:
      '四季常绿的灌木，秋天到冬天枝头密密地挂满小颗的亮橙色果实，一簇挨着一簇，是 Highlands 冬天里最显眼的颜色之一。春末会开白色小花，果实能一直挂到冬末。',
    note: '果实观赏为主、不要食用。',
    photos: [{ src: '/plants/no001-firethorn.jpg', caption: '结满亮橙色小果的火棘' }],
  },
  {
    no: 'No. 002',
    nameZh: '银杏',
    nameEn: 'Ginkgo',
    latin: 'Ginkgo biloba',
    location: 'Highlands Soccer Field, Issaquah Highlands',
    date: '2026-11-15',
    points: '扇形叶，秋季整树金黄。',
    description:
      '高大的落叶乔木，叶子是小扇子的形状，叶脉从叶柄处向外放射。春夏是清爽的绿色，一到深秋，整棵树在一两周里变成通透的金黄，站在球场边远远就能看见。它是现存最古老的树种之一，几亿年里模样几乎没变，被称作「活化石」。',
    note: '白果须煮熟、生吃有毒。',
    photos: [
      { src: '/plants/no002-ginkgo-tree.jpg', caption: '整树金黄的银杏' },
      { src: '/plants/no002-ginkgo-leaves.jpg', caption: '扇形叶特写' },
    ],
  },
  {
    no: 'No. 003',
    nameZh: '岸松',
    nameEn: 'Shore Pine',
    latin: 'Pinus contorta var. contorta',
    location: 'High Street Linear Park, Issaquah Highlands',
    date: '2026-11-17',
    points: '2 针一束，针叶短而微扭，球果小（3–5 厘米）卵形带刺。',
    description:
      '扭叶松在喀斯喀特山脉以西海岸一带的变种，是华盛顿西部的原生松。同一处长的三棵形态差别不小——一棵稀疏开张、针叶偏黄绿，一棵浓密深绿、挺拔向上——但其实是同一种，只是每棵的长势不同。它耐贫瘠、耐海风，在海岸和低地都能长，公园里这几棵还年轻，树形正在成型。',
    note: '同处三棵形态不同，实为同一种；华盛顿原生松。',
    photos: [
      { src: '/plants/no003-shore-pine-tree.jpg', caption: '浓密挺拔的岸松' },
      { src: '/plants/no003-shore-pine-needles.jpg', caption: '针叶特写，下方可见小球果' },
      { src: '/plants/no003-shore-pine-cones.jpg', caption: '成串的小球果' },
    ],
  },
  {
    no: 'No. 004',
    nameZh: '草莓树',
    nameEn: 'Strawberry Tree',
    latin: 'Arbutus unedo',
    location: 'High Street Linear Park, Issaquah Highlands',
    date: '2026-11-17',
    points:
      '革质有光泽、边缘带细锯齿的叶；圆果表面疙疙瘩瘩像草莓，黄→橙→红渐变；秋天花果同枝（下垂小铃铛花）。',
    description:
      '来自地中海一带的常绿小乔木，叶子革质有光泽、边缘带细锯齿。最特别的是秋天：去年的果子正由黄变橙、再变红，今年的小铃铛花又同时开在同一根枝上，花和果挤在一起。它跟本地野生的太平洋马醉木（Arbutus menziesii）是亲戚，但那个叶子边缘光滑、果子表面也光，仔细看就能分开。',
    note: '与太平洋马醉木区别在叶缘锯齿和果面疙瘩；果子熟透可食、未熟勿食，路边树不建议摘。',
    photos: [
      { src: '/plants/no004-strawberry-tree-canopy.jpg', caption: '挂满疙瘩果的树冠' },
      { src: '/plants/no004-strawberry-tree-fruit.jpg', caption: '红果与下垂小铃铛花同枝' },
      { src: '/plants/no004-strawberry-tree-street.jpg', caption: '路边的整树' },
    ],
  },
  {
    no: 'No. 005',
    nameZh: '红果金丝桃',
    nameEn: 'Hybrid Tutsan / Red-berry St. John\u2019s Wort',
    latin: 'Hypericum \u00d7 inodorum',
    location: 'Issaquah Highlands Lake Loop',
    date: '2026-11-17',
    points:
      '对生宽卵形深绿叶；亮黄大花 5 瓣、中间一簇金色雄蕊；圆果先绿后红、再变紫黑。',
    description:
      '金丝桃属的观赏灌木，叶子宽卵形、深绿、两两对生。花是亮黄色、五瓣，中间一簇金色雄蕊像小刷子一样炸开，特别显眼；圆果子先是绿色，熟了变鲜红，最后转成紫黑。11 月中旬还能花果同枝，在这个季节的灌木里不多见。',
    note: '11 月中仍在开花，花果同枝；果实微毒勿食，别与药用贯叶连翘混淆。',
    photos: [{ src: '/plants/no005-hypericum.jpg', caption: '亮黄花与红果、紫黑果同枝' }],
  },
];

const PlantCard = ({ plant, onPhotoClick }) => (
  <article className="mv4 pb4 bb b--white-20">
    <p className="moon-gray f6 mv1">{plant.no}</p>
    <h2 className="f2 mv1" style={{ color: '#e0ed5e' }}>
      {plant.nameZh}
      <span className="f4 ml3 moon-gray">
        {plant.nameEn} · <i>{plant.latin}</i>
      </span>
    </h2>
    {plant.description && <p className="lh-copy">{plant.description}</p>}
    <div className="flex flex-wrap mv3">
      {plant.photos.map((photo) => (
        <button
          key={photo.src}
          type="button"
          onClick={() => onPhotoClick(photo)}
          className="bn bg-transparent pa0 mr3 mb3 pointer"
          style={{ maxWidth: '320px' }}
          aria-label={`放大查看：${photo.caption}`}
        >
          <img
            src={photo.src}
            alt={photo.caption}
            className="db w-100 br2"
            loading="lazy"
          />
          <span className="db moon-gray f6 mt1 tl">{photo.caption}</span>
        </button>
      ))}
    </div>
    <dl className="lh-copy f6 f5-l">
      <div className="mv1">
        <dt className="dib b mr2">地点</dt>
        <dd className="dib ml0">{plant.location}</dd>
      </div>
      <div className="mv1">
        <dt className="dib b mr2">发现日期</dt>
        <dd className="dib ml0">{plant.date}</dd>
      </div>
      <div className="mv1">
        <dt className="dib b mr2">识别要点</dt>
        <dd className="dib ml0">{plant.points}</dd>
      </div>
      <div className="mv1">
        <dt className="dib b mr2">备注</dt>
        <dd className="dib ml0">{plant.note}</dd>
      </div>
    </dl>
  </article>
);

PlantCard.propTypes = {
  plant: PropTypes.shape({
    no: PropTypes.string.isRequired,
    nameZh: PropTypes.string.isRequired,
    nameEn: PropTypes.string.isRequired,
    latin: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    points: PropTypes.string.isRequired,
    description: PropTypes.string,
    note: PropTypes.string.isRequired,
    photos: PropTypes.arrayOf(
      PropTypes.shape({
        src: PropTypes.string.isRequired,
        caption: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onPhotoClick: PropTypes.func.isRequired,
};

const PlantsPage = () => {
  const [lightbox, setLightbox] = useState(null);

  const closeLightbox = useCallback(() => setLightbox(null), []);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, closeLightbox]);

  return (
    <Layout>
      <Helmet>
        <title>小区植物图鉴 | Meet Cri-Kee</title>
        <meta name="description" content="Issaquah Highlands 散步时记录的植物" />
      </Helmet>
      <h1 className="f-headline">小区植物图鉴</h1>
      <p>散步路上遇到的植物，一株一株认下来。照片都是自己拍的，地点都在 Issaquah Highlands 步行可达的范围里。</p>
      <p className="moon-gray">
        {PLANTS.length} 种已记录 · 4 个地点 · 始于 2026 年 11 月
      </p>
      <p className="moon-gray f6">点照片可放大，点击任意处或按 Esc 关闭。</p>
      {PLANTS.map((plant) => (
        <PlantCard key={plant.no} plant={plant} onPhotoClick={setLightbox} />
      ))}
      {lightbox && (
        <div
          role="presentation"
          onClick={closeLightbox}
          className="fixed top-0 left-0 w-100 h-100 flex items-center justify-center"
          style={{ background: 'rgba(0, 0, 0, 0.85)', zIndex: 100 }}
        >
          <figure className="ma3 tc">
            <img
              src={lightbox.src}
              alt={lightbox.caption}
              className="br2"
              style={{ maxWidth: '92vw', maxHeight: '86vh' }}
            />
            <figcaption className="white f6 mt2">{lightbox.caption}</figcaption>
          </figure>
        </div>
      )}
    </Layout>
  );
};

export default PlantsPage;
