import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { WsService } from 'src/app/services/ws.service';
import { Router } from '@angular/router';
@Component({
  selector: 'app-debut',
  templateUrl: './debut.component.html',
  styleUrls: ['./debut.component.scss']
})
export class DebutComponent implements OnInit {

  pseudo: any;
  newPseudo: any
  coOrNot = "deco";
  autresJoueurs: any;

  constructor(
    private authService: AuthService,
    private wsService: WsService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.wsService.listen('majlistJoueurs').subscribe(()=>{
      this.wsService.send('autresJoueurs', this.pseudo);
      this.wsService.listen('autresJoueursS').subscribe((list: any) => {
        this.autresJoueurs = list;
        this.majEtats();
      });
    });

    this.wsService.listen('majEtatsS').subscribe((duo:any) => {
      if(this.pseudo===duo.quiestco|| this.pseudo=== duo.joueurB){
        this.wsService.send('autresJoueurs', this.pseudo);
        this.wsService.listen('autresJoueursS').subscribe((list: any) => {
          this.autresJoueurs = list;
          this.majEtats();
        });
      }
    });

  }
  clik(){
    this.messageErreur='';
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  nouveau() {
    this.wsService.send('nouveau', this.newPseudo);
    this.wsService.listen('nouveauS').subscribe((rep)=>{
      if(rep){this.messageErreur="inscription réalisée avec succès, vous pouvez vous connecter";
    this.newPseudo='';}
      else{
        this.messageErreur= "désolé, un autre joueur possède déjà ce pseudo.";
      }
    });
  }
  //////////////////////////////////////////////////////////////////////////////////////////////
  messageErreur="";
  co() {
    this.wsService.send('co', this.pseudo);
    this.wsService.listen('coS').subscribe((reponse: any) => {
      if (reponse) {
        this.coOrNot = "co"; 
        this.authService.quiEstCo = this.pseudo;
        this.authService.coOrNot = this.coOrNot;
        this.wsService.send('autresJoueurs', this.pseudo);
        this.wsService.listen('autresJoueursS').subscribe((list: any) => {
          this.autresJoueurs = list;
          this.majEtats();
        });
      }
      else { 
        this.messageErreur = "désolé, joueur non reconnu, veuillez vous inscrire.";
      } 
    });
  }
  // maj des etats:--------------------------------------------------------------------
  majEtats() {
    for (let i = 0; i < this.autresJoueurs.length; i++) {
      if ((this.autresJoueurs[i].demandeA.find((e: any) => e === this.pseudo)) === this.pseudo) { this.autresJoueurs[i].etat = "demande"; }

      else {
        if ((this.autresJoueurs[i].invitePar.find((e: any) => e === this.pseudo)) === this.pseudo) { this.autresJoueurs[i].etat = "attente"; }

        else {
          if ((this.autresJoueurs[i].jeuEnCours.find((e: any) => e === this.pseudo))) {
            this.autresJoueurs[i].etat = 'joindre';
          }
          else { this.autresJoueurs[i].etat = 'rien'; }
        }
      }
    }
  }
  // actions selon l'etat:----------------------------------------------------
  action(joueur: any, etat: any) {
    switch (etat) {
      case 'rien': this.inviter(joueur); console.log('on invite'); break;
      case 'attente': console.log('veuillez attendre'); break;
      case 'demande': this.accepter(joueur); console.log('on accepte'); break;
      case 'joindre': this.joindre(joueur); console.log('on rejoint le jeu'); break;
      default: console.log('probleme de etat');
    }
  }
  // les actions:--------------------------------------------------------------
  inviter(ami: any) {

    let proposition = {
      quiestco: this.pseudo,
      joueurB: ami,
    }
    this.wsService.send("inviter", proposition);
    this.wsService.listen('inviterS').subscribe(() => {
      
    });
  }
  //-----------------------------------------------------------------------------
  accepter(ami: any) {
    let duo = {
      quiestco: this.pseudo,
      joueurB: ami
    }
    this.wsService.send("accepter", duo);
    this.wsService.listen('accepterS').subscribe(() => {
      

      this.authService.adversaire = ami;

      let deux = {
        joueur1: ami,
        joueur2: this.authService.quiEstCo
      }
      this.wsService.send('creer', deux);
      this.wsService.listen('creerS').subscribe((code: any) => {
        this.wsService.send('autresJoueurs', this.pseudo);
        this.authService.numero = code;
      })
    });
  }
  //---------------------------------------------------------------------------------
  joindre(ami: any) {
    let duo = {
      quiestco: this.pseudo,
      joueurB: ami
    }
    this.wsService.send('quelCode', duo);
    this.wsService.listen('quelCodeS').subscribe((code: any) => {
      this.authService.numero = code;
      this.authService.adversaire = ami;
      this.router.navigate(['game']);
    });
  }
  //////////////////////////////////////////////
  deco() {
    this.coOrNot = "deco";
    this.authService.coOrNot= "deco";
    this.wsService.send('deco', this.pseudo);
  }
}
