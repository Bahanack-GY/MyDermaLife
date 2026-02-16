import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './modules/users/users.service';
import { UserRole, UserStatus } from './modules/users/entities/user.entity';
import { DoctorsService } from './modules/doctors/doctors.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const usersService = app.get(UsersService);
    const doctorsService = app.get(DoctorsService);

    const email = 'admin@beutyinblack.com';
    const password = 'password123'; // Default password for testing

    console.log(`Checking for user ${email}...`);
    let user = await usersService.findByEmail(email);

    if (!user) {
        console.log(`User ${email} not found. Creating...`);
        user = await usersService.create({
            email,
            password,
            firstName: 'Admin',
            lastName: 'User',
            role: UserRole.DOCTOR, // Making them a doctor so they can login to doctor UI
        });
        console.log(`User created with ID: ${user.id}`);
    } else {
        console.log(`User ${email} already exists.`);
    }

    // Ensure user is active and has Doctor role
    if (user.status !== UserStatus.ACTIVE) {
        user.status = UserStatus.ACTIVE;
        await user.save();
        console.log('User activated.');
    }

    if (user.role !== UserRole.DOCTOR && user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN) {
        user.role = UserRole.DOCTOR;
        await user.save();
        console.log('User role updated to DOCTOR.');
    }

    // Ensure Doctor profile exists
    try {
        const doctor = await doctorsService.findByUserId(user.id);
        console.log('Doctor profile already exists.');
    } catch (error) {
        console.log('Doctor profile not found. Creating...');
        await doctorsService.create({
            userId: user.id,
            licenseNumber: 'DOC-' + Math.floor(Math.random() * 10000),
            specialization: 'General Dermatology',
            yearsOfExperience: 5,
            bio: 'System generated admin doctor.',
            education: [],
            certifications: [],
            languagesSpoken: ['en', 'fr'],
        });
        console.log('Doctor profile created.');
    }

    await app.close();
}

bootstrap();
