(()=>{var e={};e.id=248,e.ids=[248],e.modules={72934:e=>{"use strict";e.exports=require("next/dist/client/components/action-async-storage.external.js")},54580:e=>{"use strict";e.exports=require("next/dist/client/components/request-async-storage.external.js")},45869:e=>{"use strict";e.exports=require("next/dist/client/components/static-generation-async-storage.external.js")},20399:e=>{"use strict";e.exports=require("next/dist/compiled/next-server/app-page.runtime.prod.js")},84770:e=>{"use strict";e.exports=require("crypto")},80665:e=>{"use strict";e.exports=require("dns")},17702:e=>{"use strict";e.exports=require("events")},92048:e=>{"use strict";e.exports=require("fs")},32615:e=>{"use strict";e.exports=require("http")},32694:e=>{"use strict";e.exports=require("http2")},98216:e=>{"use strict";e.exports=require("net")},19801:e=>{"use strict";e.exports=require("os")},55315:e=>{"use strict";e.exports=require("path")},35816:e=>{"use strict";e.exports=require("process")},76162:e=>{"use strict";e.exports=require("stream")},74026:e=>{"use strict";e.exports=require("string_decoder")},82452:e=>{"use strict";e.exports=require("tls")},17360:e=>{"use strict";e.exports=require("url")},21764:e=>{"use strict";e.exports=require("util")},71568:e=>{"use strict";e.exports=require("zlib")},98061:e=>{"use strict";e.exports=require("node:assert")},92761:e=>{"use strict";e.exports=require("node:async_hooks")},72254:e=>{"use strict";e.exports=require("node:buffer")},40027:e=>{"use strict";e.exports=require("node:console")},6005:e=>{"use strict";e.exports=require("node:crypto")},65714:e=>{"use strict";e.exports=require("node:diagnostics_channel")},15673:e=>{"use strict";e.exports=require("node:events")},88849:e=>{"use strict";e.exports=require("node:http")},42725:e=>{"use strict";e.exports=require("node:http2")},87503:e=>{"use strict";e.exports=require("node:net")},38846:e=>{"use strict";e.exports=require("node:perf_hooks")},39630:e=>{"use strict";e.exports=require("node:querystring")},84492:e=>{"use strict";e.exports=require("node:stream")},31764:e=>{"use strict";e.exports=require("node:tls")},41041:e=>{"use strict";e.exports=require("node:url")},47261:e=>{"use strict";e.exports=require("node:util")},93746:e=>{"use strict";e.exports=require("node:util/types")},24086:e=>{"use strict";e.exports=require("node:worker_threads")},65628:e=>{"use strict";e.exports=require("node:zlib")},3358:(e,t,r)=>{"use strict";r.r(t),r.d(t,{GlobalError:()=>s.a,__next_app__:()=>d,originalPathname:()=>p,pages:()=>l,routeModule:()=>h,tree:()=>u}),r(65815),r(31001),r(35866),r(44975);var o=r(23191),i=r(88716),n=r(37922),s=r.n(n),a=r(95231),c={};for(let e in a)0>["default","tree","pages","GlobalError","originalPathname","__next_app__","routeModule"].indexOf(e)&&(c[e]=()=>a[e]);r.d(t,c);let u=["",{children:["(public)",{children:["legal",{children:["[slug]",{children:["__PAGE__",{},{page:[()=>Promise.resolve().then(r.bind(r,65815)),"/app/stagepass/apps/web/src/app/(public)/legal/[slug]/page.tsx"]}]},{}]},{layout:[()=>Promise.resolve().then(r.bind(r,31001)),"/app/stagepass/apps/web/src/app/(public)/legal/layout.tsx"]}]},{"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}]},{layout:[()=>Promise.resolve().then(r.bind(r,44975)),"/app/stagepass/apps/web/src/app/layout.tsx"],"not-found":[()=>Promise.resolve().then(r.t.bind(r,35866,23)),"next/dist/client/components/not-found-error"]}],l=["/app/stagepass/apps/web/src/app/(public)/legal/[slug]/page.tsx"],p="/(public)/legal/[slug]/page",d={require:r,loadChunk:()=>Promise.resolve()},h=new o.AppPageRouteModule({definition:{kind:i.x.APP_PAGE,page:"/(public)/legal/[slug]/page",pathname:"/legal/[slug]",bundlePath:"",filename:"",appPaths:[]},userland:{loaderTree:u}})},82965:(e,t,r)=>{Promise.resolve().then(r.t.bind(r,79404,23))},35303:()=>{},61085:(e,t,r)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{ReadonlyURLSearchParams:function(){return s},RedirectType:function(){return o.RedirectType},notFound:function(){return i.notFound},permanentRedirect:function(){return o.permanentRedirect},redirect:function(){return o.redirect}});let o=r(83953),i=r(16399);class n extends Error{constructor(){super("Method unavailable on `ReadonlyURLSearchParams`. Read more: https://nextjs.org/docs/app/api-reference/functions/use-search-params#updating-searchparams")}}class s extends URLSearchParams{append(){throw new n}delete(){throw new n}set(){throw new n}sort(){throw new n}}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},16399:(e,t)=>{"use strict";Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{isNotFoundError:function(){return i},notFound:function(){return o}});let r="NEXT_NOT_FOUND";function o(){let e=Error(r);throw e.digest=r,e}function i(e){return"object"==typeof e&&null!==e&&"digest"in e&&e.digest===r}("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},8586:(e,t)=>{"use strict";var r;Object.defineProperty(t,"__esModule",{value:!0}),Object.defineProperty(t,"RedirectStatusCode",{enumerable:!0,get:function(){return r}}),function(e){e[e.SeeOther=303]="SeeOther",e[e.TemporaryRedirect=307]="TemporaryRedirect",e[e.PermanentRedirect=308]="PermanentRedirect"}(r||(r={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},83953:(e,t,r)=>{"use strict";var o;Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RedirectType:function(){return o},getRedirectError:function(){return c},getRedirectStatusCodeFromError:function(){return f},getRedirectTypeFromError:function(){return h},getURLFromRedirectError:function(){return d},isRedirectError:function(){return p},permanentRedirect:function(){return l},redirect:function(){return u}});let i=r(54580),n=r(72934),s=r(8586),a="NEXT_REDIRECT";function c(e,t,r){void 0===r&&(r=s.RedirectStatusCode.TemporaryRedirect);let o=Error(a);o.digest=a+";"+t+";"+e+";"+r+";";let n=i.requestAsyncStorage.getStore();return n&&(o.mutableCookies=n.mutableCookies),o}function u(e,t){void 0===t&&(t="replace");let r=n.actionAsyncStorage.getStore();throw c(e,t,(null==r?void 0:r.isAction)?s.RedirectStatusCode.SeeOther:s.RedirectStatusCode.TemporaryRedirect)}function l(e,t){void 0===t&&(t="replace");let r=n.actionAsyncStorage.getStore();throw c(e,t,(null==r?void 0:r.isAction)?s.RedirectStatusCode.SeeOther:s.RedirectStatusCode.PermanentRedirect)}function p(e){if("object"!=typeof e||null===e||!("digest"in e)||"string"!=typeof e.digest)return!1;let[t,r,o,i]=e.digest.split(";",4),n=Number(i);return t===a&&("replace"===r||"push"===r)&&"string"==typeof o&&!isNaN(n)&&n in s.RedirectStatusCode}function d(e){return p(e)?e.digest.split(";",3)[2]:null}function h(e){if(!p(e))throw Error("Not a redirect error");return e.digest.split(";",2)[1]}function f(e){if(!p(e))throw Error("Not a redirect error");return Number(e.digest.split(";",4)[3])}(function(e){e.push="push",e.replace="replace"})(o||(o={})),("function"==typeof t.default||"object"==typeof t.default&&null!==t.default)&&void 0===t.default.__esModule&&(Object.defineProperty(t.default,"__esModule",{value:!0}),Object.assign(t.default,t),e.exports=t.default)},65815:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>a,generateStaticParams:()=>s});var o=r(19510),i=r(61085),n=r(52311);async function s(){return Object.keys(n.j).map(e=>({slug:e}))}function a({params:e}){let t=n.j[e.slug];return t||(0,i.notFound)(),o.jsx("article",{className:"prose prose-invert prose-indigo max-w-none",children:o.jsx("div",{dangerouslySetInnerHTML:{__html:t.content}})})}},31001:(e,t,r)=>{"use strict";r.r(t),r.d(t,{default:()=>s});var o=r(19510),i=r(57371),n=r(52311);function s({children:e}){return(0,o.jsxs)("div",{className:"max-w-7xl mx-auto py-12 px-4 flex flex-col md:flex-row gap-12",children:[(0,o.jsxs)("aside",{className:"w-full md:w-64 flex-shrink-0",children:[o.jsx("h3",{className:"font-bold text-stage-mutetext uppercase tracking-wider mb-4 px-2",children:"Legal Center"}),o.jsx("nav",{className:"flex flex-col space-y-1",children:Object.keys(n.j).map(e=>o.jsx(i.default,{href:`/legal/${e}`,className:"block px-3 py-2 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors capitalize",children:n.j[e].title},e))})]}),o.jsx("main",{className:"flex-1 min-w-0",children:o.jsx("div",{className:"bg-stage-panel border border-white/10 rounded-2xl p-8 md:p-12 shadow-2xl",children:e})})]})}},52311:(e,t,r)=>{"use strict";r.d(t,{j:()=>o});let o={"acceptable-use":{title:"Acceptable Use Policy",content:`
      <h1>Acceptable Use Policy</h1>
      <p>Effective Date: March 9, 2026</p>
      <p>This page sets the baseline rules for technical, legal, and platform-safe use of STAGEPASS.</p>
      
      <h2>1. General Rule</h2>
      <p>You may use the Services only for lawful purposes and in accordance with all Policies. Any use that could harm users, rights holders, infrastructure, or the integrity of STAGEPASS is prohibited.</p>

      <h2>2. Security and Integrity</h2>
      <p>You must not attempt to scan, probe, reverse engineer, tamper with, disable, or circumvent any authentication, encryption, rights-management, paywall, moderation, rate-limit, or security mechanism of the Services.</p>

      <h2>3. Abuse and Spam</h2>
      <p>Do not use the Services for spam, artificial engagement, bot amplification, misleading metadata, fake giveaways, scam promotions, phishing, malware distribution, credential theft, mass unsolicited outreach, or manipulative practices.</p>

      <h2>4. Illegal and Harmful Uses</h2>
      <p>Do not use the Services to facilitate illegal conduct, trafficking, exploitation, sanctions violations, money laundering, ransomware, revenge porn, extortion, or other harmful acts.</p>
    `},community:{title:"Community Guidelines",content:`
      <h1>Community Guidelines</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>1. Purpose</h2>
      <p>STAGEPASS is a creator-first platform built for lawful creative expression, performance, commentary, and entertainment.</p>

      <h2>2. What We Encourage</h2>
      <p>We encourage original performances, licensed music shows, thoughtful commentary, artist interviews, educational content, lawful DJ culture, creative experimentation, and respectful engagement.</p>

      <h2>3. What Is Not Allowed</h2>
      <p>Content or conduct that includes unlawful threats, targeted harassment, non-consensual sexual content, child exploitation, doxxing, stalking, fraud, impersonation, malicious deception, hateful violence, malware, or illegal activity is prohibited.</p>

      <h2>4. Music and Rights Respect</h2>
      <p>Creators should respect the rights of artists, producers, labels, publishers, and performers. If you do not have the necessary rights, do not stream, upload, or archive the material.</p>
    `},"creator-agreement":{title:"Creator Agreement",content:`
      <h1>Creator Agreement</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>1. Independent Creator Status</h2>
      <p>You act as an independent creator and not as an employee, agent, partner, representative, or spokesperson of STAGEPASS.</p>

      <h2>2. Rights and Clearances</h2>
      <p>You are solely responsible for obtaining and maintaining all licenses, clearances, permissions, consents, and releases needed for your Content and activities on the Services.</p>

      <h2>3. Music Acquisition and Use</h2>
      <p>If you purchase or lawfully obtain music from services such as Traxsource, Beatport, Bandcamp, etc., you may only use that music within the scope of the license granted to you. Purchasing a track does not automatically grant public performance rights.</p>

      <h2>4. Creator Grant to STAGEPASS</h2>
      <p>You grant STAGEPASS the rights described in the Terms of Service so that we may host, process, stream, distribute, and technically adapt your Content.</p>
    `},dmca:{title:"DMCA Takedown Policy",content:`
      <h1>DMCA Takedown Policy</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>A. Designated Agent</h2>
      <p>STAGEPASS has adopted this policy to comply with the Digital Millennium Copyright Act (“DMCA”). Notices should be sent to our Designated Agent.</p>

      <h2>B. Filing a DMCA Notice</h2>
      <p>If you believe Content available through the Services infringes your copyright, send a written notification including identification of the work, the infringing material, and your contact info.</p>

      <h2>C. Counter-Notification</h2>
      <p>If you believe your Content was removed by mistake, you may submit a counter-notification where authorized by law.</p>

      <h2>D. Repeat Infringer Policy</h2>
      <p>STAGEPASS may terminate or restrict Accounts of Users who repeatedly infringe the rights of others.</p>
    `},moderation:{title:"Platform Moderation Policy",content:`
      <h1>Platform Moderation Policy</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>1. Principles</h2>
      <p>Our moderation approach is intended to be transparent, proportionate, and protective of lawful expression while reducing legal, safety, and integrity risks.</p>

      <h2>2. Available Actions</h2>
      <p>Moderation actions may include education notices, warnings, metadata corrections, age gates, geoblocks, temporary feature restrictions, stream interruption, content removal, or account suspension.</p>

      <h2>3. Reports and Review</h2>
      <p>Users may report content or conduct. Reports may be reviewed by human moderators, automated systems, or a combination of both.</p>
    `},privacy:{title:"Privacy Policy",content:`
      <h1>Privacy Policy</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>1. Scope</h2>
      <p>This Privacy Policy explains how STAGEPASS collects, uses, discloses, stores, and protects Personal Information.</p>

      <h2>2. Information We Collect</h2>
      <p>We may collect account and profile information, creator and content information, communications, and device/usage data.</p>

      <h2>3. How We Use Information</h2>
      <p>We use information to provide and maintain the Services, authenticate users, host content, prevent fraud, and comply with legal obligations.</p>

      <h2>4. How We Disclose Information</h2>
      <p>We may disclose information to service providers, rights holders, law enforcement, or in connection with a business transfer.</p>
    `},terms:{title:"Terms of Service",content:`
      <h1>Terms of Service</h1>
      <p>Effective Date: March 9, 2026</p>
      
      <h2>1. Acceptance</h2>
      <p>By using STAGEPASS, you agree to these Terms. If you represent an organization, you bind it.</p>

      <h2>2. Eligibility</h2>
      <p>You must be at least 18 years old or the age of majority in your jurisdiction to use the Services.</p>

      <h2>3. Nature of Services</h2>
      <p>STAGEPASS is a creator ecosystem for uploading, hosting, streaming, and presenting content. We act as a neutral platform.</p>

      <h2>5. User Content</h2>
      <p>Creators retain ownership of their content but grant licenses to STAGEPASS. Creators are responsible for their uploads.</p>

      <h2>7. Music Rights</h2>
      <p>Creators are responsible for obtaining all necessary rights and licenses for music used in any format on the platform.</p>
    `}}}};var t=require("../../../../webpack-runtime.js");t.C(e);var r=e=>t(t.s=e),o=t.X(0,[276,2,453],()=>r(3358));module.exports=o})();