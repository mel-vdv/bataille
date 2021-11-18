
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WsService } from 'src/app/services/ws.service';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  quiEstCo: any;
  coOrNot: any;
  numero: any;
  adversaire: any;
  //------------------------
  statut: any;
  auTourDe: any;
  joueur1: any; score1: any;
  joueur2: any; score2: any;
  sixCartes: any;
  tas: any; longueurdutas: any;
  //---------------------------------------
  constructor(
    private wsService: WsService,
    private authService: AuthService
  ) { }
  //---------------------------------------

  ngOnInit(): void {
    this.quiEstCo = this.authService.quiEstCo;
    this.numero = this.authService.numero;
    this.coOrNot = this.authService.coOrNot;
    this.adversaire = this.authService.adversaire;
    //-----------------------------------------------
    this.wsService.send('rejoindre', this.numero);
    this.wsService.listen('maj').subscribe((num: any) => {
      if (this.numero === num) {
        this.wsService.send('rejoindre', this.numero);
      }
    });
    this.wsService.listen('rejoindreS').subscribe((partie: any) => {
      this.statut = partie.statut; this.auTourDe = partie.auTourDe;
      this.joueur1 = partie.joueur1; this.score1 = partie.score1;
      this.joueur2 = partie.joueur2; this.score2 = partie.score2;
      this.sixCartes = partie.sixCartes; this.tas = partie.tas;
      this.longueurdutas = partie.tas.length;
      if(partie.clics === 0){this.renouveller();}
    });
    //------------------------------------------
  

  }
  ////////////////////////////////////////////////////////////
 
  retourner(perso: any, index: number) {
    if (this.quiEstCo === this.auTourDe) {
      this.sixCartes[index].image = perso;

      let tab = perso.split('');
      let nombre = tab.shift();
      if (this.quiEstCo === this.joueur1) {
        this.score1 = this.score1 + parseInt(nombre);
      }
      else {
        this.score2 = this.score2 + parseInt(nombre);
      }
      let maj = {
        num: this.numero,
        score1: this.score1, score2: this.score2,
        sixCartes: this.sixCartes
      }
      this.wsService.send('retourner', maj);
      this.wsService.listen('retournerS').subscribe(()=>{
      this.auSuivant();
      });
    }
  }
  //---------------------------------------
  auSuivant() {
    let osvt = {
      num: this.numero,
      adv: this.adversaire
    }
    this.wsService.send('auSuivant', osvt);
  }
  //-----------------------------------------
  renouveller() {
    for (let i = 1; i < 6; i++) {
      let numAleatoire = Math.floor(Math.random() * this.longueurdutas);

      this.sixCartes.push(
        {
          'perso': this.tas[numAleatoire],
          'image': 'dos',
          'index': i
        });
      this.tas = this.tas.filter((e: any) => e !== this.tas[numAleatoire]);
let renvl= {
  num : this.numero,
  sixCartes: this.sixCartes,
  tas: this.tas
}
      this.wsService.send('renouveller',renvl);
    }
  }
/////////////////////////////////////////////////////////////////////////////////
}

