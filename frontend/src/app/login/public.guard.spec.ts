import { TestBed } from '@angular/core/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { ActivatedRouteSnapshot, Router, UrlTree } from '@angular/router';

import { PublicGuard } from './public.guard';
import { selectPublicAccess } from '@data/systemproperties/systemproperties.selectors';

describe('PublicGuard', () => {
  let guard: PublicGuard;
  let store: MockStore;
  let router: jasmine.SpyObj<Router>;

  // Minimal route stub exposing only the routeConfig.path the guard reads.
  const routeFor = (path: string) => ({ routeConfig: { path } }) as ActivatedRouteSnapshot;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    // Echo the commands back so we can assert on the redirect target.
    routerSpy.createUrlTree.and.callFake((commands: unknown[]) => ({ commands }) as unknown as UrlTree);

    TestBed.configureTestingModule({
      providers: [provideMockStore(), { provide: Router, useValue: routerSpy }]
    });

    guard = TestBed.inject(PublicGuard);
    store = TestBed.inject(MockStore);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
  });

  it('redirects the root path to /public when public access is enabled', (done) => {
    store.overrideSelector(selectPublicAccess, true);

    guard.canActivate(routeFor('')).subscribe(() => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/public']);
      done();
    });
  });

  it('redirects the root path to /map when public access is disabled', (done) => {
    store.overrideSelector(selectPublicAccess, false);

    guard.canActivate(routeFor('')).subscribe(() => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/map']);
      done();
    });
  });

  it('redirects /public to /login when public access is disabled', (done) => {
    store.overrideSelector(selectPublicAccess, false);

    guard.canActivate(routeFor('public')).subscribe(() => {
      expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
      done();
    });
  });

  it('allows /public when public access is enabled', (done) => {
    store.overrideSelector(selectPublicAccess, true);

    guard.canActivate(routeFor('public')).subscribe((result) => {
      expect(result).toBe(true);
      expect(router.createUrlTree).not.toHaveBeenCalled();
      done();
    });
  });
});
