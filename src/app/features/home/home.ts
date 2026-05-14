import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-home',
  imports:     [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {


greeting = ''

  quickActions = [
    { icon: '🗺️', label: 'Safe Route',   route: '/route-finder',       color: '#1D9E75', bg: 'rgba(29,158,117,0.1)'  },
    { icon: '🚨', label: 'Report',        route: '/incidents/report',   color: '#E5A020', bg: 'rgba(229,160,32,0.1)'  },
    { icon: '📍', label: 'Nearby',        route: '/incidents/nearby',   color: '#534AB7', bg: 'rgba(83,74,183,0.1)'   },
    { icon: '👤', label: 'Profile',       route: '/profile',            color: '#D85A30', bg: 'rgba(216,90,48,0.1)'   },
  ]
   recentIncidents = [
    { type: 'ROBBERY',    area: 'Connaught Place', time: '15 min ago', color: '#D85A30', dist: '200m' },
    { type: 'SUSPICIOUS', area: 'Karol Bagh',      time: '1 hr ago',  color: '#E5A020', dist: '450m' },
    { type: 'PROTEST',    area: 'India Gate',      time: '2 hr ago',  color: '#E5A020', dist: '1.2km'},
  ]

  constructor(public auth: AuthService) {}

  ngOnInit(): void {
    const hour = new Date().getHours()
    if (hour < 12)      this.greeting = 'Good morning'
    else if (hour < 17) this.greeting = 'Good afternoon'
    else                this.greeting = 'Good evening'
  }
}
