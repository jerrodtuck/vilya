import { expect, it } from 'vitest';
import { stackOf } from './meta';
it('fixture stack labels and fallback boundaries',()=>{ for(const [slug,label] of [['vl-crucible-fastapi','FastAPI / Python'],['vl-crucible-django','Django / Python'],['vl-crucible-ml','Python ML / Data'],['vl-crucible-blazor','Blazor / .NET'],['vl-crucible-nextjs','Next.js / React'],['vl-crucible-html','any stack'],['vl-start-feature','any stack'],['html','any stack']]) expect(stackOf(slug)).toBe(label); });
