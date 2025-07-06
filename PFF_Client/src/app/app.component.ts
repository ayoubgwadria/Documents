import {  ChangeDetectorRef, Component,  OnInit,  OnDestroy } from "@angular/core"
import {  Router, NavigationEnd } from "@angular/router"
import  { UserServicesService } from "./services/user-services.service"
import  { Subscription } from "rxjs"
import { filter } from "rxjs/operators"

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  standalone: false,
  styleUrl: "./app.component.css",
})
export class AppComponent implements OnInit, OnDestroy {
  title = "PFF_Client"
  id: string | null = null
  isLoggedIn = false
  private routerSubscription?: Subscription

  constructor(
    private router: Router,
    private userService: UserServicesService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Check initial login status
    this.checkLoginStatus()

    // Listen to route changes to update login status
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkLoginStatus()
      })

    // Listen to storage changes (for when user logs out in another tab)
    window.addEventListener("storage", this.onStorageChange.bind(this))
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe()
    }
    window.removeEventListener("storage", this.onStorageChange.bind(this))
  }

  private checkLoginStatus(): void {
    const userId = this.userService.getCurrentUserId()
    this.id = userId !== null ? userId.toString() : null
    this.isLoggedIn = this.id !== null && this.id !== ""
    this.cdr.detectChanges()
  }

  private onStorageChange(event: StorageEvent): void {
    // React to localStorage changes (useful for multi-tab scenarios)
    if (event.key === "userId" || event.key === null) {
      this.checkLoginStatus()
    }
  }

  logout(): void {
    if (confirm("Êtes-vous sûr de vouloir vous déconnecter?")) {
      localStorage.clear()
      this.checkLoginStatus() // Update the login status immediately
      this.router.navigate(["/sign"])
      console.log("User logged out")
    }
  }
}
