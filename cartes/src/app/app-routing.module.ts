import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DebutComponent } from './components/debut/debut.component';
import { GameComponent } from './components/game/game.component';

const routes: Routes = [
  {path: '',
  component: DebutComponent
  },
  {
    path: 'game',
    component: GameComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
