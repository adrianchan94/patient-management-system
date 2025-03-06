import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Organisation } from './organisation';
import { Result } from './result';

@Entity('profile')
export class Profile {

    @PrimaryGeneratedColumn('uuid', { name: 'profileid' })
    profileId: string;

    @CreateDateColumn({ name: 'datetime', type: 'timestamp without time zone' })
    datetime: Date;

    @Column('text', { name: 'name', nullable: false })
    name: string;

    @OneToMany(type => Result, result => result.profile, { eager: false })
    result: Result[];

    @ManyToOne(type => Organisation, organisation => organisation.profile)
    organisation: Organisation;

}
